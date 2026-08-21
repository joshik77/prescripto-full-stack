import React, {
    useContext,
    useEffect,
    useState
} from "react";

import {
    DoctorContext
} from "../../context/DoctorContext";

import {
    AppContext
} from "../../context/AppContext";

import {
    toast
} from "react-toastify";

import axios from "axios";


const DoctorProfile = () => {

    const {
        dToken,
        profileData,
        setProfileData,
        getProfileData
    } = useContext(DoctorContext);

    const {
        currency,
        backendUrl
    } = useContext(AppContext);

    const [isEdit, setIsEdit] =
        useState(false);

    const [leaveDate, setLeaveDate] =
        useState("");


    const days = [
        {
            key: "monday",
            label: "Monday"
        },
        {
            key: "tuesday",
            label: "Tuesday"
        },
        {
            key: "wednesday",
            label: "Wednesday"
        },
        {
            key: "thursday",
            label: "Thursday"
        },
        {
            key: "friday",
            label: "Friday"
        },
        {
            key: "saturday",
            label: "Saturday"
        },
        {
            key: "sunday",
            label: "Sunday"
        }
    ];


    const defaultWorkingHours = {

        sunday: {
            enabled: false,
            startTime: "10:00",
            endTime: "21:00"
        },

        monday: {
            enabled: true,
            startTime: "10:00",
            endTime: "21:00"
        },

        tuesday: {
            enabled: true,
            startTime: "10:00",
            endTime: "21:00"
        },

        wednesday: {
            enabled: true,
            startTime: "10:00",
            endTime: "21:00"
        },

        thursday: {
            enabled: true,
            startTime: "10:00",
            endTime: "21:00"
        },

        friday: {
            enabled: true,
            startTime: "10:00",
            endTime: "21:00"
        },

        saturday: {
            enabled: true,
            startTime: "10:00",
            endTime: "21:00"
        }
    };


    const ensureScheduleExists = () => {

        if (!profileData) {
            return;
        }

        if (
            !profileData.workingHours ||
            Object.keys(
                profileData.workingHours
            ).length === 0
        ) {

            setProfileData(
                prev => ({
                    ...prev,
                    workingHours:
                        defaultWorkingHours,
                    leaveDates:
                        prev.leaveDates || []
                })
            );
        }
    };


    const updateWorkingDay = (
        day,
        field,
        value
    ) => {

        setProfileData(
            prev => ({

                ...prev,

                workingHours: {

                    ...prev.workingHours,

                    [day]: {

                        ...prev.workingHours[day],

                        [field]: value
                    }
                }
            })
        );
    };


    const addLeaveDate = () => {

        if (!leaveDate) {

            toast.warning(
                "Please select a leave date"
            );

            return;
        }

        const selected =
            new Date(
                `${leaveDate}T00:00:00`
            );

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        if (selected < today) {

            toast.warning(
                "You cannot add a past date"
            );

            return;
        }

        const [
            year,
            month,
            day
        ] = leaveDate.split("-");

        const formatted =
            `${Number(day)}_${Number(month)}_${year}`;

        if (
            profileData.leaveDates?.includes(
                formatted
            )
        ) {

            toast.warning(
                "This leave date is already added"
            );

            return;
        }

        setProfileData(
            prev => ({

                ...prev,

                leaveDates: [
                    ...(prev.leaveDates || []),
                    formatted
                ]
            })
        );

        setLeaveDate("");
    };


    const removeLeaveDate = (
        date
    ) => {

        setProfileData(
            prev => ({

                ...prev,

                leaveDates:
                    prev.leaveDates.filter(
                        item =>
                            item !== date
                    )
            })
        );
    };


    const formatLeaveDate = (
        dateString
    ) => {

        try {

            const [
                day,
                month,
                year
            ] = dateString.split("_");

            const date =
                new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day)
                );

            return date.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

        } catch (error) {

            return dateString;
        }
    };


    const updateProfile =
        async () => {

            try {

                const workingHours =
                    profileData.workingHours ||
                    defaultWorkingHours;


                for (
                    const {
                        key,
                        label
                    } of days
                ) {

                    const schedule =
                        workingHours[key];

                    if (
                        schedule?.enabled &&
                        (
                            !schedule.startTime ||
                            !schedule.endTime
                        )
                    ) {

                        toast.error(
                            `Please select start and end time for ${label}`
                        );

                        return;
                    }

                    if (
                        schedule?.enabled &&
                        schedule.startTime >=
                        schedule.endTime
                    ) {

                        toast.error(
                            `End time must be after start time for ${label}`
                        );

                        return;
                    }
                }


                const updateData = {

                    address:
                        profileData.address,

                    fees:
                        profileData.fees,

                    about:
                        profileData.about,

                    available:
                        profileData.available,

                    workingHours,

                    leaveDates:
                        profileData.leaveDates || []
                };


                const { data } =
                    await axios.post(

                        backendUrl +
                        "/api/doctor/update-profile",

                        updateData,

                        {
                            headers: {
                                dToken
                            }
                        }
                    );


                if (data.success) {

                    toast.success(
                        data.message
                    );

                    setIsEdit(false);

                    await getProfileData();

                } else {

                    toast.error(
                        data.message
                    );
                }

            } catch (error) {

                console.log(error);

                toast.error(
                    error.response?.data?.message ||
                    error.message
                );
            }
        };


    useEffect(() => {

        if (dToken) {

            getProfileData();
        }

    }, [dToken]);


    useEffect(() => {

        ensureScheduleExists();

    }, [profileData?._id]);


    return profileData && (

        <div>

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    m-5
                "
            >

                <div>

                    <img
                        className="
                            bg-primary/80
                            w-full
                            sm:max-w-64
                            rounded-lg
                        "
                        src={profileData.image}
                        alt=""
                    />

                </div>


                <div
                    className="
                        flex-1
                        border
                        border-stone-100
                        rounded-lg
                        p-8
                        py-7
                        bg-white
                    "
                >

                    <p
                        className="
                            flex
                            items-center
                            gap-2
                            text-3xl
                            font-medium
                            text-gray-700
                        "
                    >
                        {profileData.name}
                    </p>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            mt-1
                            text-gray-600
                        "
                    >

                        <p>
                            {profileData.degree}
                            {" - "}
                            {profileData.speciality}
                        </p>

                        <button
                            className="
                                py-0.5
                                px-2
                                border
                                text-xs
                                rounded-full
                            "
                        >
                            {profileData.experience}
                        </button>

                    </div>


                    <div>

                        <p
                            className="
                                flex
                                items-center
                                gap-1
                                text-sm
                                font-medium
                                text-[#262626]
                                mt-3
                            "
                        >
                            About :
                        </p>

                        <div
                            className="
                                text-sm
                                text-gray-600
                                max-w-[700px]
                                mt-1
                            "
                        >

                            {
                                isEdit
                                    ? (
                                        <textarea
                                            onChange={
                                                e =>
                                                    setProfileData(
                                                        prev => ({
                                                            ...prev,
                                                            about:
                                                                e.target.value
                                                        })
                                                    )
                                            }
                                            className="
                                                w-full
                                                outline-primary
                                                p-2
                                                border
                                                rounded
                                            "
                                            rows={6}
                                            value={
                                                profileData.about
                                            }
                                        />
                                    )
                                    : (
                                        <p>
                                            {profileData.about}
                                        </p>
                                    )
                            }

                        </div>

                    </div>


                    <p
                        className="
                            text-gray-600
                            font-medium
                            mt-4
                        "
                    >

                        Appointment fee:{" "}

                        <span
                            className="
                                text-gray-800
                            "
                        >

                            {currency}{" "}

                            {
                                isEdit
                                    ? (
                                        <input
                                            type="number"
                                            onChange={
                                                e =>
                                                    setProfileData(
                                                        prev => ({
                                                            ...prev,
                                                            fees:
                                                                e.target.value
                                                        })
                                                    )
                                            }
                                            value={
                                                profileData.fees
                                            }
                                            className="
                                                border
                                                rounded
                                                px-2
                                                py-1
                                                w-28
                                            "
                                        />
                                    )
                                    : profileData.fees
                            }

                        </span>

                    </p>


                    <div
                        className="
                            flex
                            gap-2
                            py-2
                        "
                    >

                        <p>
                            Address:
                        </p>

                        <div
                            className="
                                text-sm
                            "
                        >

                            {
                                isEdit
                                    ? (
                                        <>
                                            <input
                                                type="text"
                                                onChange={
                                                    e =>
                                                        setProfileData(
                                                            prev => ({
                                                                ...prev,
                                                                address: {
                                                                    ...prev.address,
                                                                    line1:
                                                                        e.target.value
                                                                }
                                                            })
                                                        )
                                                }
                                                value={
                                                    profileData.address.line1
                                                }
                                                className="
                                                    border
                                                    rounded
                                                    px-2
                                                    py-1
                                                    mb-2
                                                "
                                            />

                                            <br />

                                            <input
                                                type="text"
                                                onChange={
                                                    e =>
                                                        setProfileData(
                                                            prev => ({
                                                                ...prev,
                                                                address: {
                                                                    ...prev.address,
                                                                    line2:
                                                                        e.target.value
                                                                }
                                                            })
                                                        )
                                                }
                                                value={
                                                    profileData.address.line2
                                                }
                                                className="
                                                    border
                                                    rounded
                                                    px-2
                                                    py-1
                                                "
                                            />
                                        </>
                                    )
                                    : (
                                        <>
                                            {profileData.address.line1}
                                            <br />
                                            {profileData.address.line2}
                                        </>
                                    )
                            }

                        </div>

                    </div>


                    <div
                        className="
                            flex
                            gap-2
                            items-center
                            pt-2
                        "
                    >

                        <input
                            type="checkbox"
                            onChange={() =>
                                isEdit &&
                                setProfileData(
                                    prev => ({
                                        ...prev,
                                        available:
                                            !prev.available
                                    })
                                )
                            }
                            checked={
                                profileData.available
                            }
                        />

                        <label>
                            Available for appointments
                        </label>

                    </div>


                    <div
                        className="
                            mt-8
                            border-t
                            pt-6
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-xl
                                    font-semibold
                                    text-gray-700
                                "
                            >
                                Weekly Working Hours
                            </p>

                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    mt-1
                                "
                            >
                                Choose your working days
                                and appointment timings.
                            </p>

                        </div>


                        <div
                            className="
                                mt-5
                                flex
                                flex-col
                                gap-3
                                max-w-3xl
                            "
                        >

                            {
                                days.map(
                                    ({
                                        key,
                                        label
                                    }) => {

                                        const schedule =
                                            profileData
                                                .workingHours?.[key] ||
                                            defaultWorkingHours[key];

                                        return (

                                            <div
                                                key={key}
                                                className="
                                                    flex
                                                    flex-col
                                                    sm:flex-row
                                                    sm:items-center
                                                    gap-3
                                                    border
                                                    rounded-lg
                                                    p-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        sm:w-36
                                                    "
                                                >

                                                    <input
                                                        type="checkbox"
                                                        disabled={
                                                            !isEdit
                                                        }
                                                        checked={
                                                            schedule.enabled
                                                        }
                                                        onChange={
                                                            e =>
                                                                updateWorkingDay(
                                                                    key,
                                                                    "enabled",
                                                                    e.target.checked
                                                                )
                                                        }
                                                    />

                                                    <p
                                                        className="
                                                            font-medium
                                                            text-gray-700
                                                        "
                                                    >
                                                        {label}
                                                    </p>

                                                </div>


                                                {
                                                    schedule.enabled
                                                        ? (
                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    flex-wrap
                                                                "
                                                            >

                                                                <input
                                                                    type="time"
                                                                    disabled={
                                                                        !isEdit
                                                                    }
                                                                    value={
                                                                        schedule.startTime
                                                                    }
                                                                    onChange={
                                                                        e =>
                                                                            updateWorkingDay(
                                                                                key,
                                                                                "startTime",
                                                                                e.target.value
                                                                            )
                                                                    }
                                                                    className="
                                                                        border
                                                                        rounded
                                                                        px-3
                                                                        py-2
                                                                        disabled:bg-gray-50
                                                                    "
                                                                />

                                                                <span>
                                                                    to
                                                                </span>

                                                                <input
                                                                    type="time"
                                                                    disabled={
                                                                        !isEdit
                                                                    }
                                                                    value={
                                                                        schedule.endTime
                                                                    }
                                                                    onChange={
                                                                        e =>
                                                                            updateWorkingDay(
                                                                                key,
                                                                                "endTime",
                                                                                e.target.value
                                                                            )
                                                                    }
                                                                    className="
                                                                        border
                                                                        rounded
                                                                        px-3
                                                                        py-2
                                                                        disabled:bg-gray-50
                                                                    "
                                                                />

                                                            </div>
                                                        )
                                                        : (
                                                            <p
                                                                className="
                                                                    text-sm
                                                                    text-gray-400
                                                                "
                                                            >
                                                                Not working
                                                            </p>
                                                        )
                                                }

                                            </div>
                                        );
                                    }
                                )
                            }

                        </div>

                    </div>


                    <div
                        className="
                            mt-8
                            border-t
                            pt-6
                        "
                    >

                        <p
                            className="
                                text-xl
                                font-semibold
                                text-gray-700
                            "
                        >
                            Leave / Unavailable Dates
                        </p>

                        <p
                            className="
                                text-sm
                                text-gray-500
                                mt-1
                            "
                        >
                            Patients will not be able
                            to book appointments on
                            these dates.
                        </p>


                        {
                            isEdit && (

                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        gap-3
                                        mt-4
                                    "
                                >

                                    <input
                                        type="date"
                                        value={
                                            leaveDate
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        onChange={
                                            e =>
                                                setLeaveDate(
                                                    e.target.value
                                                )
                                        }
                                        className="
                                            border
                                            rounded-lg
                                            px-3
                                            py-2
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            addLeaveDate
                                        }
                                        className="
                                            bg-primary
                                            text-white
                                            px-5
                                            py-2
                                            rounded-lg
                                        "
                                    >
                                        Add Leave Date
                                    </button>

                                </div>
                            )
                        }


                        <div
                            className="
                                flex
                                flex-wrap
                                gap-2
                                mt-4
                            "
                        >

                            {
                                profileData
                                    .leaveDates
                                    ?.length > 0
                                    ? (
                                        profileData
                                            .leaveDates
                                            .map(
                                                date => (

                                                    <div
                                                        key={date}
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            bg-red-50
                                                            text-red-600
                                                            border
                                                            border-red-200
                                                            rounded-full
                                                            px-4
                                                            py-2
                                                            text-sm
                                                        "
                                                    >

                                                        <span>
                                                            {formatLeaveDate(date)}
                                                        </span>

                                                        {
                                                            isEdit && (

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeLeaveDate(
                                                                            date
                                                                        )
                                                                    }
                                                                    className="
                                                                        font-bold
                                                                        text-red-500
                                                                        hover:text-red-700
                                                                    "
                                                                >
                                                                    ×
                                                                </button>
                                                            )
                                                        }

                                                    </div>
                                                )
                                            )
                                    )
                                    : (
                                        <p
                                            className="
                                                text-sm
                                                text-gray-400
                                            "
                                        >
                                            No leave dates added.
                                        </p>
                                    )
                            }

                        </div>

                    </div>


                    {
                        isEdit
                            ? (
                                <div
                                    className="
                                        flex
                                        gap-3
                                        mt-7
                                    "
                                >

                                    <button
                                        onClick={
                                            updateProfile
                                        }
                                        className="
                                            px-6
                                            py-2
                                            bg-primary
                                            text-white
                                            text-sm
                                            rounded-full
                                        "
                                    >
                                        Save Changes
                                    </button>

                                    <button
                                        onClick={
                                            async () => {

                                                setIsEdit(false);

                                                setLeaveDate("");

                                                await getProfileData();
                                            }
                                        }
                                        className="
                                            px-6
                                            py-2
                                            border
                                            text-sm
                                            rounded-full
                                        "
                                    >
                                        Cancel
                                    </button>

                                </div>
                            )
                            : (
                                <button
                                    onClick={() =>
                                        setIsEdit(true)
                                    }
                                    className="
                                        px-6
                                        py-2
                                        border
                                        border-primary
                                        text-primary
                                        text-sm
                                        rounded-full
                                        mt-7
                                        hover:bg-primary
                                        hover:text-white
                                        transition-all
                                    "
                                >
                                    Edit Profile & Schedule
                                </button>
                            )
                    }

                </div>

            </div>

        </div>
    );
};

export default DoctorProfile;