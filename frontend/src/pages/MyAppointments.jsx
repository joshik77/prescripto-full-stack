import React, {
    useContext,
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    AppContext
} from "../context/AppContext";

import axios from "axios";

import {
    toast
} from "react-toastify";

import {
    assets
} from "../assets/assets";


const MyAppointments = () => {

    const {
        backendUrl,
        token,
        getDoctosData
    } = useContext(
        AppContext
    );

    const navigate =
        useNavigate();

    const [
        appointments,
        setAppointments
    ] = useState([]);

    const [
        payment,
        setPayment
    ] = useState("");

    const [
        reviewAppointment,
        setReviewAppointment
    ] = useState(null);

    const [
        rating,
        setRating
    ] = useState(0);

    const [
        hoverRating,
        setHoverRating
    ] = useState(0);

    const [
        reviewText,
        setReviewText
    ] = useState("");

    const [
        submittingReview,
        setSubmittingReview
    ] = useState(false);


    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    const slotDateFormat = (
        slotDate
    ) => {

        const dateArray =
            slotDate.split("_");

        return (
            dateArray[0] +
            " " +
            months[
                Number(
                    dateArray[1]
                ) - 1
            ] +
            " " +
            dateArray[2]
        );
    };


    const getUserAppointments =
    async () => {

        try {

            const {
                data
            } = await axios.get(

                backendUrl +
                "/api/user/appointments",

                {
                    headers: {
                        token
                    }
                }
            );

            if (data.success) {

                setAppointments(
                    [
                        ...data.appointments
                    ].reverse()
                );

            } else {

                toast.error(
                    data.message
                );
            }

        } catch (error) {

            console.error(
                "GET APPOINTMENTS ERROR:",
                error
            );

            toast.error(
                error.response
                    ?.data
                    ?.message ||
                error.message
            );
        }
    };


    const cancelAppointment =
    async (
        appointmentId
    ) => {

        try {

            const {
                data
            } = await axios.post(

                backendUrl +
                "/api/user/cancel-appointment",

                {
                    appointmentId
                },

                {
                    headers: {
                        token
                    }
                }
            );

            if (data.success) {

                toast.success(
                    data.message
                );

                getUserAppointments();

            } else {

                toast.error(
                    data.message
                );
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


    const rescheduleAppointment =
    item => {

        navigate(
            `/appointment/${item.docId}`,
            {
                state: {
                    rescheduleId:
                        item._id
                }
            }
        );
    };


    const openReview =
    item => {

        setReviewAppointment(
            item
        );

        setRating(0);

        setHoverRating(0);

        setReviewText("");
    };


    const closeReview = () => {

        setReviewAppointment(
            null
        );

        setRating(0);

        setHoverRating(0);

        setReviewText("");
    };


    const submitReview =
    async () => {

        if (
            !reviewAppointment
        ) {
            return;
        }

        if (
            rating < 1 ||
            rating > 5
        ) {

            toast.warning(
                "Please select a rating"
            );

            return;
        }

        if (
            reviewText
                .trim()
                .length < 3
        ) {

            toast.warning(
                "Please write a short review"
            );

            return;
        }

        if (
            reviewText
                .trim()
                .length > 500
        ) {

            toast.warning(
                "Review cannot exceed 500 characters"
            );

            return;
        }

        try {

            setSubmittingReview(
                true
            );

            const {
                data
            } = await axios.post(

                backendUrl +
                "/api/user/add-review",

                {
                    appointmentId:
                        reviewAppointment
                            ._id,

                    rating,

                    comment:
                        reviewText
                            .trim()
                },

                {
                    headers: {
                        token
                    }
                }
            );

            if (data.success) {

                toast.success(
                    data.message
                );

                closeReview();

                await getUserAppointments();

                if (
                    getDoctosData
                ) {

                    await getDoctosData();
                }

            } else {

                toast.error(
                    data.message
                );
            }

        } catch (error) {

            toast.error(
                error.response
                    ?.data
                    ?.message ||
                error.message
            );

        } finally {

            setSubmittingReview(
                false
            );
        }
    };


    const initPay =
    order => {

        if (
            !window.Razorpay
        ) {

            toast.error(
                "Razorpay SDK is not loaded. Please refresh the page."
            );

            return;
        }

        const razorpayKey =
            import.meta.env
                .VITE_RAZORPAY_KEY_ID;

        if (!razorpayKey) {

            toast.error(
                "Razorpay Key ID is missing."
            );

            return;
        }

        if (
            !order ||
            !order.id ||
            !order.amount ||
            !order.currency
        ) {

            toast.error(
                "Invalid Razorpay order."
            );

            return;
        }


        const options = {

            key:
                razorpayKey,

            amount:
                order.amount,

            currency:
                order.currency,

            name:
                "Prescripto",

            description:
                "Doctor Appointment Payment",

            order_id:
                order.id,

            handler:
                async function (
                    response
                ) {

                    try {

                        const {
                            data
                        } =
                            await axios.post(

                                backendUrl +
                                "/api/user/verifyRazorpay",

                                {
                                    razorpay_order_id:
                                        response
                                            .razorpay_order_id,

                                    razorpay_payment_id:
                                        response
                                            .razorpay_payment_id,

                                    razorpay_signature:
                                        response
                                            .razorpay_signature
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
                                "Payment Successful"
                            );

                            setPayment("");

                            await getUserAppointments();

                        } else {

                            toast.error(
                                data.message ||
                                "Payment verification failed"
                            );
                        }

                    } catch (error) {

                        toast.error(
                            error.response
                                ?.data
                                ?.message ||
                            error.message
                        );
                    }
                }
        };


        const rzp =
            new window.Razorpay(
                options
            );

        rzp.on(
            "payment.failed",
            function (
                response
            ) {

                toast.error(
                    response.error
                        ?.description ||
                    "Razorpay payment failed"
                );
            }
        );

        rzp.open();
    };


    const appointmentRazorpay =
    async (
        appointmentId
    ) => {

        try {

            const {
                data
            } = await axios.post(

                backendUrl +
                "/api/user/payment-razorpay",

                {
                    appointmentId
                },

                {
                    headers: {
                        token
                    }
                }
            );

            if (data.success) {

                initPay(
                    data.order
                );

            } else {

                toast.error(
                    data.message ||
                    "Unable to create Razorpay order"
                );
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


    const appointmentStripe =
    async (
        appointmentId
    ) => {

        try {

            const {
                data
            } = await axios.post(

                backendUrl +
                "/api/user/payment-stripe",

                {
                    appointmentId
                },

                {
                    headers: {
                        token
                    }
                }
            );

            if (data.success) {

                window.location.replace(
                    data.session_url
                );

            } else {

                toast.error(
                    data.message
                );
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

        if (token) {

            getUserAppointments();
        }

    }, [token]);


    return (

        <div>

            <p
                className="
                    pb-3
                    mt-12
                    text-lg
                    font-medium
                    text-gray-600
                    border-b
                "
            >
                My appointments
            </p>


            <div>

                {
                    appointments.map(
                        item => (

                            <div
                                key={
                                    item._id
                                }
                                className="
                                    grid
                                    grid-cols-[1fr_2fr]
                                    gap-4
                                    sm:flex
                                    sm:gap-6
                                    py-4
                                    border-b
                                "
                            >

                                <div>

                                    <img
                                        className="
                                            w-36
                                            bg-[#EAEFFF]
                                        "
                                        src={
                                            item
                                                .docData
                                                .image
                                        }
                                        alt=""
                                    />

                                </div>


                                <div
                                    className="
                                        flex-1
                                        text-sm
                                        text-[#5E5E5E]
                                    "
                                >

                                    <p
                                        className="
                                            text-[#262626]
                                            text-base
                                            font-semibold
                                        "
                                    >
                                        {
                                            item
                                                .docData
                                                .name
                                        }
                                    </p>

                                    <p>
                                        {
                                            item
                                                .docData
                                                .speciality
                                        }
                                    </p>


                                    <p
                                        className="
                                            text-[#464646]
                                            font-medium
                                            mt-1
                                        "
                                    >
                                        Address:
                                    </p>

                                    <p>
                                        {
                                            item
                                                .docData
                                                .address
                                                .line1
                                        }
                                    </p>

                                    <p>
                                        {
                                            item
                                                .docData
                                                .address
                                                .line2
                                        }
                                    </p>


                                    <p
                                        className="
                                            mt-1
                                        "
                                    >

                                        <span
                                            className="
                                                text-sm
                                                text-[#3C3C3C]
                                                font-medium
                                            "
                                        >
                                            Date & Time:
                                        </span>

                                        {" "}

                                        {
                                            slotDateFormat(
                                                item
                                                    .slotDate
                                            )
                                        }

                                        {" | "}

                                        {
                                            item
                                                .slotTime
                                        }

                                    </p>

                                </div>


                                <div></div>


                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-2
                                        justify-end
                                        text-sm
                                        text-center
                                    "
                                >

                                    {
                                        !item.cancelled &&
                                        !item.payment &&
                                        !item.isCompleted &&
                                        payment !==
                                            item._id && (

                                            <button
                                                onClick={() =>
                                                    setPayment(
                                                        item._id
                                                    )
                                                }
                                                className="
                                                    text-[#696969]
                                                    sm:min-w-48
                                                    py-2
                                                    border
                                                    rounded
                                                    hover:bg-primary
                                                    hover:text-white
                                                    transition-all
                                                    duration-300
                                                "
                                            >
                                                Pay Online
                                            </button>
                                        )
                                    }


                                    {
                                        !item.cancelled &&
                                        !item.payment &&
                                        !item.isCompleted &&
                                        payment ===
                                            item._id && (

                                            <button
                                                onClick={() =>
                                                    appointmentStripe(
                                                        item._id
                                                    )
                                                }
                                                className="
                                                    text-[#696969]
                                                    sm:min-w-48
                                                    py-2
                                                    border
                                                    rounded
                                                    flex
                                                    items-center
                                                    justify-center
                                                "
                                            >

                                                <img
                                                    className="
                                                        max-w-20
                                                        max-h-5
                                                    "
                                                    src={
                                                        assets
                                                            .stripe_logo
                                                    }
                                                    alt=""
                                                />

                                            </button>
                                        )
                                    }


                                    {
                                        !item.cancelled &&
                                        !item.payment &&
                                        !item.isCompleted &&
                                        payment ===
                                            item._id && (

                                            <button
                                                onClick={() =>
                                                    appointmentRazorpay(
                                                        item._id
                                                    )
                                                }
                                                className="
                                                    text-[#696969]
                                                    sm:min-w-48
                                                    py-2
                                                    border
                                                    rounded
                                                    flex
                                                    items-center
                                                    justify-center
                                                "
                                            >

                                                <img
                                                    className="
                                                        max-w-20
                                                        max-h-5
                                                    "
                                                    src={
                                                        assets
                                                            .razorpay_logo
                                                    }
                                                    alt=""
                                                />

                                            </button>
                                        )
                                    }


                                    {
                                        !item.cancelled &&
                                        item.payment &&
                                        !item.isCompleted && (

                                            <button
                                                className="
                                                    sm:min-w-48
                                                    py-2
                                                    border
                                                    rounded
                                                    text-[#696969]
                                                    bg-[#EAEFFF]
                                                "
                                            >
                                                Paid
                                            </button>
                                        )
                                    }


                                    {
                                        item.isCompleted && (

                                            <button
                                                className="
                                                    sm:min-w-48
                                                    py-2
                                                    border
                                                    border-green-500
                                                    rounded
                                                    text-green-500
                                                "
                                            >
                                                Completed
                                            </button>
                                        )
                                    }


                                    {
                                        item.isCompleted &&
                                        !item.cancelled &&
                                        !item.reviewed && (

                                            <button
                                                onClick={() =>
                                                    openReview(
                                                        item
                                                    )
                                                }
                                                className="
                                                    sm:min-w-48
                                                    py-2
                                                    rounded
                                                    bg-yellow-400
                                                    hover:bg-yellow-500
                                                    text-gray-900
                                                    font-medium
                                                    transition-all
                                                "
                                            >
                                                ★ Write Review
                                            </button>
                                        )
                                    }


                                    {
                                        item.isCompleted &&
                                        item.reviewed && (

                                            <button
                                                disabled
                                                className="
                                                    sm:min-w-48
                                                    py-2
                                                    border
                                                    border-yellow-400
                                                    rounded
                                                    text-yellow-600
                                                    bg-yellow-50
                                                "
                                            >
                                                ★ Reviewed
                                            </button>
                                        )
                                    }


                                    {
                                        !item.cancelled &&
                                        !item.isCompleted && (

                                            <button
                                                onClick={() =>
                                                    rescheduleAppointment(
                                                        item
                                                    )
                                                }
                                                className="
                                                    text-[#696969]
                                                    sm:min-w-48
                                                    py-2
                                                    border
                                                    rounded
                                                    hover:bg-primary
                                                    hover:text-white
                                                    transition-all
                                                    duration-300
                                                "
                                            >
                                                Reschedule appointment
                                            </button>
                                        )
                                    }


                                    {
                                        !item.cancelled &&
                                        !item.isCompleted && (

                                            <button
                                                onClick={() =>
                                                    cancelAppointment(
                                                        item._id
                                                    )
                                                }
                                                className="
                                                    text-[#696969]
                                                    sm:min-w-48
                                                    py-2
                                                    border
                                                    rounded
                                                    hover:bg-red-600
                                                    hover:text-white
                                                    transition-all
                                                    duration-300
                                                "
                                            >
                                                Cancel appointment
                                            </button>
                                        )
                                    }


                                    {
                                        item.cancelled &&
                                        !item.isCompleted && (

                                            <button
                                                className="
                                                    sm:min-w-48
                                                    py-2
                                                    border
                                                    border-red-500
                                                    rounded
                                                    text-red-500
                                                "
                                            >
                                                Appointment cancelled
                                            </button>
                                        )
                                    }

                                </div>

                            </div>
                        )
                    )
                }

            </div>


            {
                reviewAppointment && (

                    <div
                        className="
                            fixed
                            inset-0
                            bg-black/40
                            flex
                            items-center
                            justify-center
                            z-50
                            px-4
                        "
                    >

                        <div
                            className="
                                bg-white
                                w-full
                                max-w-md
                                rounded-xl
                                p-6
                                shadow-xl
                            "
                        >

                            <div
                                className="
                                    flex
                                    justify-between
                                    items-start
                                    gap-3
                                "
                            >

                                <div>

                                    <h2
                                        className="
                                            text-xl
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        Rate your doctor
                                    </h2>

                                    <p
                                        className="
                                            text-sm
                                            text-gray-500
                                            mt-1
                                        "
                                    >
                                        {
                                            reviewAppointment
                                                .docData
                                                .name
                                        }
                                    </p>

                                </div>


                                <button
                                    onClick={
                                        closeReview
                                    }
                                    className="
                                        text-gray-500
                                        text-2xl
                                    "
                                >
                                    ×
                                </button>

                            </div>


                            <div
                                className="
                                    flex
                                    gap-2
                                    mt-6
                                "
                            >

                                {
                                    [
                                        1,
                                        2,
                                        3,
                                        4,
                                        5
                                    ].map(
                                        star => (

                                            <button
                                                type="button"
                                                key={
                                                    star
                                                }
                                                onMouseEnter={() =>
                                                    setHoverRating(
                                                        star
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    setHoverRating(
                                                        0
                                                    )
                                                }
                                                onClick={() =>
                                                    setRating(
                                                        star
                                                    )
                                                }
                                                className={`
                                                    text-4xl
                                                    transition-all

                                                    ${
                                                        star <=
                                                        (
                                                            hoverRating ||
                                                            rating
                                                        )
                                                            ? "text-yellow-400"
                                                            : "text-gray-300"
                                                    }
                                                `}
                                            >
                                                ★
                                            </button>
                                        )
                                    )
                                }

                            </div>


                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    mt-2
                                "
                            >

                                {
                                    rating > 0
                                        ? `${rating} out of 5`
                                        : "Select your rating"
                                }

                            </p>


                            <textarea
                                value={
                                    reviewText
                                }
                                onChange={
                                    e =>
                                        setReviewText(
                                            e.target.value
                                        )
                                }
                                maxLength={
                                    500
                                }
                                rows={
                                    5
                                }
                                placeholder="Share your experience with this doctor..."
                                className="
                                    w-full
                                    border
                                    rounded-lg
                                    p-3
                                    mt-5
                                    outline-primary
                                    resize-none
                                "
                            />


                            <p
                                className="
                                    text-xs
                                    text-right
                                    text-gray-400
                                    mt-1
                                "
                            >
                                {
                                    reviewText
                                        .length
                                }
                                /500
                            </p>


                            <div
                                className="
                                    flex
                                    gap-3
                                    mt-5
                                "
                            >

                                <button
                                    onClick={
                                        closeReview
                                    }
                                    disabled={
                                        submittingReview
                                    }
                                    className="
                                        flex-1
                                        border
                                        rounded-lg
                                        py-2.5
                                        text-gray-600
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    onClick={
                                        submitReview
                                    }
                                    disabled={
                                        submittingReview
                                    }
                                    className="
                                        flex-1
                                        bg-primary
                                        text-white
                                        rounded-lg
                                        py-2.5
                                        disabled:opacity-60
                                    "
                                >

                                    {
                                        submittingReview
                                            ? "Submitting..."
                                            : "Submit Review"
                                    }

                                </button>

                            </div>

                        </div>

                    </div>
                )
            }

        </div>
    );
};

export default MyAppointments;