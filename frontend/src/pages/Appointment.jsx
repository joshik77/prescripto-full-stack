import React, {
    useContext,
    useEffect,
    useState
} from "react";

import {
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    AppContext
} from "../context/AppContext";

import {
    assets
} from "../assets/assets";

import RelatedDoctors
    from "../components/RelatedDoctors";

import axios from "axios";

import {
    toast
} from "react-toastify";


const Appointment = () => {

    const {
        docId
    } = useParams();

    const location =
        useLocation();

    const navigate =
        useNavigate();

    const rescheduleId =
        location.state
            ?.rescheduleId ||
        null;

    const {
        doctors,
        currencySymbol,
        backendUrl,
        token,
        getDoctosData
    } = useContext(
        AppContext
    );


    const daysOfWeek = [
        "SUN",
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT"
    ];


    const dayKeys = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
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


    const [
        docInfo,
        setDocInfo
    ] = useState(false);

    const [
        docSlots,
        setDocSlots
    ] = useState([]);

    const [
        slotIndex,
        setSlotIndex
    ] = useState(0);

    const [
        slotTime,
        setSlotTime
    ] = useState("");

    const [
        reviews,
        setReviews
    ] = useState([]);


    const fetchDocInfo = () => {

        const doctor =
            doctors.find(
                doc =>
                    doc._id ===
                    docId
            );

        setDocInfo(
            doctor
        );
    };


    const getDoctorReviews =
    async () => {

        try {

            const {
                data
            } = await axios.get(

                backendUrl +
                `/api/user/doctor-reviews/${docId}`
            );

            if (
                data.success
            ) {

                setReviews(
                    data.reviews
                );
            }

        } catch (error) {

            console.error(
                "GET REVIEWS ERROR:",
                error
            );
        }
    };


    const getSlotDateString =
    date => {

        const day =
            date.getDate();

        const month =
            date.getMonth() + 1;

        const year =
            date.getFullYear();

        return (
            day +
            "_" +
            month +
            "_" +
            year
        );
    };


    const convertTimeToMinutes =
    time => {

        const [
            hours,
            minutes
        ] = time.split(":");

        return (
            Number(hours) *
            60 +
            Number(minutes)
        );
    };


    const formatMinutesToTime =
    totalMinutes => {

        const hours =
            Math.floor(
                totalMinutes /
                60
            );

        const minutes =
            totalMinutes %
            60;

        const date =
            new Date();

        date.setHours(
            hours,
            minutes,
            0,
            0
        );

        return date
            .toLocaleTimeString(
                [],
                {
                    hour:
                        "2-digit",
                    minute:
                        "2-digit"
                }
            );
    };


    const formatReviewDate =
    timestamp => {

        return new Date(
            timestamp
        ).toLocaleDateString(
            "en-IN",
            {
                day:
                    "numeric",
                month:
                    "short",
                year:
                    "numeric"
            }
        );
    };


    const getAvailableSolts = () => {

        if (!docInfo) {
            return;
        }

        const generatedSlots =
            [];

        const today =
            new Date();

        const workingHours =
            docInfo
                .workingHours &&
            Object.keys(
                docInfo
                    .workingHours
            ).length > 0
                ? docInfo
                    .workingHours
                : defaultWorkingHours;

        const leaveDates =
            docInfo
                .leaveDates ||
            [];


        for (
            let i = 0;
            i < 14;
            i++
        ) {

            const currentDate =
                new Date(
                    today
                );

            currentDate
                .setDate(
                    today
                        .getDate() +
                    i
                );

            currentDate
                .setHours(
                    0,
                    0,
                    0,
                    0
                );


            const dayKey =
                dayKeys[
                    currentDate
                        .getDay()
                ];


            const schedule =
                workingHours[
                    dayKey
                ] ||
                defaultWorkingHours[
                    dayKey
                ];


            const slotDate =
                getSlotDateString(
                    currentDate
                );


            const isLeaveDate =
                leaveDates
                    .includes(
                        slotDate
                    );


            const timeSlots =
                [];


            if (
                schedule
                    ?.enabled &&
                !isLeaveDate
            ) {

                const startMinutes =
                    convertTimeToMinutes(
                        schedule
                            .startTime
                    );

                const endMinutes =
                    convertTimeToMinutes(
                        schedule
                            .endTime
                    );


                for (
                    let minutes =
                        startMinutes;

                    minutes <
                        endMinutes;

                    minutes += 30
                ) {

                    const slotDateTime =
                        new Date(
                            currentDate
                        );

                    slotDateTime
                        .setHours(
                            Math.floor(
                                minutes /
                                60
                            ),
                            minutes %
                            60,
                            0,
                            0
                        );


                    if (
                        slotDateTime <=
                        new Date()
                    ) {
                        continue;
                    }


                    const formattedTime =
                        formatMinutesToTime(
                            minutes
                        );


                    const bookedSlots =
                        docInfo
                            .slots_booked
                            ?.[
                                slotDate
                            ] ||
                        [];


                    if (
                        !bookedSlots
                            .includes(
                                formattedTime
                            )
                    ) {

                        timeSlots.push({

                            datetime:
                                new Date(
                                    slotDateTime
                                ),

                            time:
                                formattedTime,

                            slotDate
                        });
                    }
                }
            }


            generatedSlots.push({

                date:
                    new Date(
                        currentDate
                    ),

                slotDate,

                dayKey,

                isLeaveDate,

                workingDay:
                    Boolean(
                        schedule
                            ?.enabled
                    ),

                slots:
                    timeSlots
            });
        }


        setDocSlots(
            generatedSlots
        );


        const firstAvailableIndex =
            generatedSlots
                .findIndex(
                    day =>
                        day
                            .slots
                            .length >
                        0
                );


        setSlotIndex(
            firstAvailableIndex >=
            0
                ? firstAvailableIndex
                : 0
        );

        setSlotTime("");
    };


    const submitAppointment =
    async () => {

        if (!token) {

            toast.warning(
                "Login to book appointment"
            );

            return navigate(
                "/login"
            );
        }


        if (
            !docInfo.available
        ) {

            toast.warning(
                "Doctor is currently unavailable"
            );

            return;
        }


        if (!slotTime) {

            toast.warning(
                "Please select an appointment time"
            );

            return;
        }


        const selectedDay =
            docSlots[
                slotIndex
            ];


        if (
            !selectedDay ||
            selectedDay
                .slots
                .length === 0
        ) {

            toast.error(
                "No appointment slots available for this date"
            );

            return;
        }


        const slotDate =
            selectedDay
                .slotDate;


        try {

            if (
                rescheduleId
            ) {

                const {
                    data
                } = await axios.post(

                    backendUrl +
                    "/api/user/reschedule-appointment",

                    {
                        appointmentId:
                            rescheduleId,

                        slotDate,

                        slotTime
                    },

                    {
                        headers: {
                            token
                        }
                    }
                );


                if (
                    data.success
                ) {

                    toast.success(
                        data.message
                    );

                    await getDoctosData();

                    navigate(
                        "/my-appointments",
                        {
                            replace:
                                true
                        }
                    );

                } else {

                    toast.error(
                        data.message
                    );
                }

            } else {

                const {
                    data
                } = await axios.post(

                    backendUrl +
                    "/api/user/book-appointment",

                    {
                        docId,
                        slotDate,
                        slotTime
                    },

                    {
                        headers: {
                            token
                        }
                    }
                );


                if (
                    data.success
                ) {

                    toast.success(
                        data.message
                    );

                    await getDoctosData();

                    navigate(
                        "/my-appointments"
                    );

                } else {

                    toast.error(
                        data.message
                    );
                }
            }

        } catch (error) {

            toast.error(
                error.response
                    ?.data
                    ?.message ||
                error.message
            );
        }
    };


    useEffect(() => {

        if (
            doctors.length >
            0
        ) {

            fetchDocInfo();
        }

    }, [
        doctors,
        docId
    ]);


    useEffect(() => {

        if (docInfo) {

            getAvailableSolts();
        }

    }, [docInfo]);


    useEffect(() => {

        if (docId) {

            getDoctorReviews();
        }

    }, [
        docId,
        backendUrl
    ]);


    return docInfo ? (

        <div>


            <div
                className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-4
                "
            >

                <div>

                    <img
                        className="
                            bg-primary
                            w-full
                            sm:max-w-72
                            rounded-lg
                        "
                        src={
                            docInfo.image
                        }
                        alt=""
                    />

                </div>


                <div
                    className="
                        flex-1
                        border
                        border-[#ADADAD]
                        rounded-lg
                        p-8
                        py-7
                        bg-white
                        mx-2
                        sm:mx-0
                        mt-[-80px]
                        sm:mt-0
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

                        {
                            docInfo.name
                        }

                        <img
                            className="
                                w-5
                            "
                            src={
                                assets
                                    .verified_icon
                            }
                            alt=""
                        />

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
                            {
                                docInfo.degree
                            }
                            {" - "}
                            {
                                docInfo
                                    .speciality
                            }
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
                            {
                                docInfo
                                    .experience
                            }
                        </button>

                    </div>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            mt-3
                        "
                    >

                        <span
                            className="
                                text-yellow-500
                                text-xl
                            "
                        >
                            ★
                        </span>

                        <span
                            className="
                                font-medium
                                text-gray-700
                            "
                        >
                            {
                                Number(
                                    docInfo
                                        .rating ||
                                    0
                                ).toFixed(
                                    1
                                )
                            }
                        </span>

                        <span
                            className="
                                text-sm
                                text-gray-500
                            "
                        >
                            (
                            {
                                docInfo
                                    .reviewCount ||
                                0
                            }
                            {" "}
                            reviews)
                        </span>

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
                            About

                            <img
                                className="
                                    w-3
                                "
                                src={
                                    assets
                                        .info_icon
                                }
                                alt=""
                            />

                        </p>


                        <p
                            className="
                                text-sm
                                text-gray-600
                                max-w-[700px]
                                mt-1
                            "
                        >
                            {
                                docInfo.about
                            }
                        </p>

                    </div>


                    <p
                        className="
                            text-gray-600
                            font-medium
                            mt-4
                        "
                    >
                        Appointment fee:
                        {" "}

                        <span
                            className="
                                text-gray-800
                            "
                        >
                            {
                                currencySymbol
                            }
                            {
                                docInfo.fees
                            }
                        </span>
                    </p>


                    <div
                        className="
                            mt-3
                        "
                    >

                        {
                            docInfo
                                .available
                                ? (
                                    <p
                                        className="
                                            text-green-600
                                            text-sm
                                        "
                                    >
                                        ● Currently accepting appointments
                                    </p>
                                )
                                : (
                                    <p
                                        className="
                                            text-red-500
                                            text-sm
                                        "
                                    >
                                        ● Doctor is currently unavailable
                                    </p>
                                )
                        }

                    </div>

                </div>

            </div>


            <div
                className="
                    sm:ml-72
                    sm:pl-4
                    mt-8
                    font-medium
                    text-[#565656]
                "
            >

                <p>
                    {
                        rescheduleId
                            ? "Select a new appointment slot"
                            : "Booking slots"
                    }
                </p>


                {
                    rescheduleId && (

                        <p
                            className="
                                text-sm
                                font-normal
                                text-gray-500
                                mt-1
                            "
                        >
                            Choose a new date and time for your appointment.
                        </p>
                    )
                }


                {
                    !docInfo
                        .available
                        ? (

                            <div
                                className="
                                    mt-5
                                    bg-red-50
                                    border
                                    border-red-200
                                    text-red-600
                                    p-4
                                    rounded-lg
                                    max-w-xl
                                "
                            >
                                This doctor is currently not accepting appointments.
                            </div>
                        )
                        : (

                            <>

                                <div
                                    className="
                                        flex
                                        gap-3
                                        items-center
                                        w-full
                                        overflow-x-auto
                                        mt-4
                                        pb-2
                                    "
                                >

                                    {
                                        docSlots.map(
                                            (
                                                item,
                                                index
                                            ) => {

                                                const unavailable =
                                                    item
                                                        .slots
                                                        .length ===
                                                    0;

                                                return (

                                                    <div
                                                        key={
                                                            item
                                                                .slotDate
                                                        }
                                                        onClick={() => {

                                                            if (
                                                                !unavailable
                                                            ) {

                                                                setSlotIndex(
                                                                    index
                                                                );

                                                                setSlotTime(
                                                                    ""
                                                                );
                                                            }
                                                        }}
                                                        className={`
                                                            text-center
                                                            py-4
                                                            px-3
                                                            min-w-20
                                                            rounded-xl
                                                            transition-all

                                                            ${
                                                                unavailable
                                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                    : "cursor-pointer"
                                                            }

                                                            ${
                                                                slotIndex ===
                                                                index &&
                                                                !unavailable
                                                                    ? "bg-primary text-white"
                                                                    : !unavailable
                                                                        ? "border border-[#DDDDDD]"
                                                                        : ""
                                                            }
                                                        `}
                                                    >

                                                        <p
                                                            className="
                                                                text-xs
                                                            "
                                                        >
                                                            {
                                                                daysOfWeek[
                                                                    item
                                                                        .date
                                                                        .getDay()
                                                                ]
                                                            }
                                                        </p>


                                                        <p
                                                            className="
                                                                text-lg
                                                                font-medium
                                                            "
                                                        >
                                                            {
                                                                item
                                                                    .date
                                                                    .getDate()
                                                            }
                                                        </p>


                                                        <p
                                                            className="
                                                                text-xs
                                                            "
                                                        >
                                                            {
                                                                item
                                                                    .date
                                                                    .toLocaleDateString(
                                                                        "en-US",
                                                                        {
                                                                            month:
                                                                                "short"
                                                                        }
                                                                    )
                                                            }
                                                        </p>


                                                        {
                                                            item
                                                                .isLeaveDate && (

                                                                <p
                                                                    className="
                                                                        text-[10px]
                                                                        mt-1
                                                                    "
                                                                >
                                                                    Leave
                                                                </p>
                                                            )
                                                        }


                                                        {
                                                            !item
                                                                .workingDay &&
                                                            !item
                                                                .isLeaveDate && (

                                                                <p
                                                                    className="
                                                                        text-[10px]
                                                                        mt-1
                                                                    "
                                                                >
                                                                    Closed
                                                                </p>
                                                            )
                                                        }

                                                    </div>
                                                );
                                            }
                                        )
                                    }

                                </div>


                                {
                                    docSlots[
                                        slotIndex
                                    ]?.slots
                                        ?.length >
                                    0
                                        ? (

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                    w-full
                                                    overflow-x-auto
                                                    mt-4
                                                    pb-2
                                                "
                                            >

                                                {
                                                    docSlots[
                                                        slotIndex
                                                    ].slots.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => (

                                                            <p
                                                                key={
                                                                    index
                                                                }
                                                                onClick={() =>
                                                                    setSlotTime(
                                                                        item.time
                                                                    )
                                                                }
                                                                className={`
                                                                    text-sm
                                                                    font-light
                                                                    flex-shrink-0
                                                                    px-5
                                                                    py-2
                                                                    rounded-full
                                                                    cursor-pointer

                                                                    ${
                                                                        item.time ===
                                                                        slotTime
                                                                            ? "bg-primary text-white"
                                                                            : "text-[#949494] border border-[#B4B4B4]"
                                                                    }
                                                                `}
                                                            >
                                                                {
                                                                    item
                                                                        .time
                                                                        .toLowerCase()
                                                                }
                                                            </p>
                                                        )
                                                    )
                                                }

                                            </div>

                                        )
                                        : (

                                            <p
                                                className="
                                                    mt-4
                                                    text-sm
                                                    text-gray-500
                                                "
                                            >
                                                No appointment slots available for this date.
                                            </p>
                                        )
                                }


                                <button
                                    onClick={
                                        submitAppointment
                                    }
                                    disabled={
                                        !slotTime
                                    }
                                    className={`
                                        text-white
                                        text-sm
                                        font-light
                                        px-20
                                        py-3
                                        rounded-full
                                        my-6
                                        transition-all

                                        ${
                                            slotTime
                                                ? "bg-primary cursor-pointer"
                                                : "bg-gray-400 cursor-not-allowed"
                                        }
                                    `}
                                >
                                    {
                                        rescheduleId
                                            ? "Confirm reschedule"
                                            : "Book an appointment"
                                    }
                                </button>

                            </>
                        )
                }

            </div>


            {
                !rescheduleId && (

                    <div
                        className="
                            mt-12
                            border-t
                            pt-8
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                flex-wrap
                                gap-3
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-2xl
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Patient Reviews
                                </h2>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Reviews from patients who completed appointments.
                                </p>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <span
                                    className="
                                        text-yellow-500
                                        text-2xl
                                    "
                                >
                                    ★
                                </span>

                                <span
                                    className="
                                        text-xl
                                        font-semibold
                                    "
                                >
                                    {
                                        Number(
                                            docInfo
                                                .rating ||
                                            0
                                        ).toFixed(
                                            1
                                        )
                                    }
                                </span>

                                <span
                                    className="
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    {
                                        docInfo
                                            .reviewCount ||
                                        0
                                    }
                                    {" "}
                                    reviews
                                </span>

                            </div>

                        </div>


                        {
                            reviews.length ===
                            0
                                ? (

                                    <div
                                        className="
                                            bg-gray-50
                                            rounded-lg
                                            p-6
                                            mt-5
                                            text-gray-500
                                            text-sm
                                        "
                                    >
                                        No reviews yet.
                                    </div>

                                )
                                : (

                                    <div
                                        className="
                                            grid
                                            gap-4
                                            mt-5
                                        "
                                    >

                                        {
                                            reviews.map(
                                                review => (

                                                    <div
                                                        key={
                                                            review
                                                                ._id
                                                        }
                                                        className="
                                                            border
                                                            rounded-xl
                                                            p-5
                                                            bg-white
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-3
                                                            "
                                                        >

                                                            {
                                                                review
                                                                    .userImage
                                                                    ? (

                                                                        <img
                                                                            src={
                                                                                review
                                                                                    .userImage
                                                                            }
                                                                            alt=""
                                                                            className="
                                                                                w-10
                                                                                h-10
                                                                                rounded-full
                                                                                object-cover
                                                                            "
                                                                        />
                                                                    )
                                                                    : (

                                                                        <div
                                                                            className="
                                                                                w-10
                                                                                h-10
                                                                                rounded-full
                                                                                bg-[#EAEFFF]
                                                                                flex
                                                                                items-center
                                                                                justify-center
                                                                                font-semibold
                                                                                text-primary
                                                                            "
                                                                        >
                                                                            {
                                                                                review
                                                                                    .userName
                                                                                    ?.charAt(
                                                                                        0
                                                                                    )
                                                                                    ?.toUpperCase()
                                                                            }
                                                                        </div>
                                                                    )
                                                            }


                                                            <div
                                                                className="
                                                                    flex-1
                                                                "
                                                            >

                                                                <p
                                                                    className="
                                                                        font-medium
                                                                        text-gray-800
                                                                    "
                                                                >
                                                                    {
                                                                        review
                                                                            .userName
                                                                    }
                                                                </p>

                                                                <p
                                                                    className="
                                                                        text-xs
                                                                        text-gray-400
                                                                    "
                                                                >
                                                                    {
                                                                        formatReviewDate(
                                                                            review
                                                                                .date
                                                                        )
                                                                    }
                                                                </p>

                                                            </div>


                                                            <div
                                                                className="
                                                                    text-yellow-400
                                                                    tracking-wide
                                                                "
                                                            >

                                                                {
                                                                    [1,2,3,4,5]
                                                                        .map(
                                                                            star => (
                                                                                <span
                                                                                    key={
                                                                                        star
                                                                                    }
                                                                                    className={
                                                                                        star <=
                                                                                        review
                                                                                            .rating
                                                                                            ? "text-yellow-400"
                                                                                            : "text-gray-300"
                                                                                    }
                                                                                >
                                                                                    ★
                                                                                </span>
                                                                            )
                                                                        )
                                                                }

                                                            </div>

                                                        </div>


                                                        <p
                                                            className="
                                                                text-sm
                                                                text-gray-600
                                                                mt-4
                                                                leading-6
                                                            "
                                                        >
                                                            {
                                                                review
                                                                    .comment
                                                            }
                                                        </p>

                                                    </div>
                                                )
                                            )
                                        }

                                    </div>
                                )
                        }

                    </div>
                )
            }


            {
                !rescheduleId && (

                    <RelatedDoctors
                        speciality={
                            docInfo
                                .speciality
                        }
                        docId={
                            docId
                        }
                    />
                )
            }

        </div>

    ) : null;
};

export default Appointment;