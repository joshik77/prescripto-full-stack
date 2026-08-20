import React, {
    useContext,
    useEffect,
    useState
} from 'react'

import { useNavigate } from 'react-router-dom'

import {
    AppContext
} from '../context/AppContext'

import axios from 'axios'

import {
    toast
} from 'react-toastify'

import {
    assets
} from '../assets/assets'


const MyAppointments = () => {

    const {
        backendUrl,
        token
    } = useContext(AppContext)

    const navigate =
        useNavigate()

    const [
        appointments,
        setAppointments
    ] = useState([])

    const [
        payment,
        setPayment
    ] = useState('')


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
    ]


    const slotDateFormat = (
        slotDate
    ) => {

        const dateArray =
            slotDate.split('_')

        return (
            dateArray[0] +
            " " +
            months[
                Number(dateArray[1]) - 1
            ] +
            " " +
            dateArray[2]
        )
    }


    // ==================================================
    // GET APPOINTMENTS
    // ==================================================

    const getUserAppointments =
        async () => {

            try {

                const {
                    data
                } = await axios.get(

                    backendUrl +
                    '/api/user/appointments',

                    {
                        headers: {
                            token
                        }
                    }
                )


                if (data.success) {

                    setAppointments(
                        [...data.appointments]
                            .reverse()
                    )

                } else {

                    toast.error(
                        data.message
                    )
                }

            } catch (error) {

                console.error(
                    "GET APPOINTMENTS ERROR:",
                    error.response?.data ||
                    error
                )

                toast.error(
                    error.response?.data?.message ||
                    error.message
                )
            }
        }


    // ==================================================
    // CANCEL APPOINTMENT
    // ==================================================

    const cancelAppointment =
        async (
            appointmentId
        ) => {

            try {

                const {
                    data
                } = await axios.post(

                    backendUrl +
                    '/api/user/cancel-appointment',

                    {
                        appointmentId
                    },

                    {
                        headers: {
                            token
                        }
                    }
                )


                if (data.success) {

                    toast.success(
                        data.message
                    )

                    getUserAppointments()

                } else {

                    toast.error(
                        data.message
                    )
                }

            } catch (error) {

                console.error(
                    "CANCEL ERROR:",
                    error.response?.data ||
                    error
                )

                toast.error(
                    error.response?.data?.message ||
                    error.message
                )
            }
        }


    // ==================================================
    // RESCHEDULE APPOINTMENT
    // ==================================================

    const rescheduleAppointment = (item) => {
        navigate(`/appointment/${item.docId}`, {
            state: {
                rescheduleId: item._id
            }
        })
    }


    // ==================================================
    // RAZORPAY CHECKOUT
    // ==================================================

    const initPay = (
        order
    ) => {

        console.log(
            "================================"
        )

        console.log(
            "RAZORPAY CHECKOUT"
        )

        console.log(
            "Order:",
            order
        )

        console.log(
            "Frontend Razorpay Key:",
            import.meta.env
                .VITE_RAZORPAY_KEY_ID
        )

        console.log(
            "================================"
        )


        // Razorpay SDK check
        if (!window.Razorpay) {

            toast.error(
                "Razorpay SDK is not loaded. Please refresh the page."
            )

            console.error(
                "window.Razorpay is undefined"
            )

            return
        }


        const razorpayKey =
            import.meta.env
                .VITE_RAZORPAY_KEY_ID


        if (!razorpayKey) {

            toast.error(
                "Razorpay Key ID is missing."
            )

            console.error(
                "VITE_RAZORPAY_KEY_ID is undefined"
            )

            return
        }


        if (
            !order ||
            !order.id ||
            !order.amount ||
            !order.currency
        ) {

            toast.error(
                "Invalid Razorpay order."
            )

            console.error(
                "INVALID RAZORPAY ORDER:",
                order
            )

            return
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

                    console.log(
                        "RAZORPAY SUCCESS:",
                        response
                    )


                    try {

                        const {
                            data
                        } = await axios.post(

                            backendUrl +
                            "/api/user/verifyRazorpay",

                            {
                                razorpay_order_id:
                                    response.razorpay_order_id,

                                razorpay_payment_id:
                                    response.razorpay_payment_id,

                                razorpay_signature:
                                    response.razorpay_signature
                            },

                            {
                                headers: {
                                    token
                                }
                            }
                        )


                        console.log(
                            "VERIFY RESPONSE:",
                            data
                        )


                        if (
                            data.success
                        ) {

                            toast.success(
                                "Payment Successful"
                            )

                            setPayment('')

                            await getUserAppointments()

                            navigate(
                                "/my-appointments"
                            )

                        } else {

                            toast.error(
                                data.message ||
                                "Payment verification failed"
                            )
                        }

                    } catch (error) {

                        console.error(
                            "VERIFY ERROR:",
                            error.response?.data ||
                            error
                        )

                        toast.error(
                            error.response?.data?.message ||
                            error.message ||
                            "Payment verification failed"
                        )
                    }
                }
        }


        const rzp =
            new window.Razorpay(
                options
            )


        // THIS IS VERY IMPORTANT
        rzp.on(
            "payment.failed",
            function (
                response
            ) {

                console.error(
                    "================================"
                )

                console.error(
                    "RAZORPAY PAYMENT FAILED"
                )

                console.error(
                    response
                )

                console.error(
                    "Code:",
                    response.error?.code
                )

                console.error(
                    "Description:",
                    response.error?.description
                )

                console.error(
                    "Source:",
                    response.error?.source
                )

                console.error(
                    "Step:",
                    response.error?.step
                )

                console.error(
                    "Reason:",
                    response.error?.reason
                )

                console.error(
                    "================================"
                )


                const error =
                    response.error || {}


                toast.error(
                    error.description ||
                    "Razorpay payment failed"
                )


                alert(

                    "RAZORPAY PAYMENT FAILED\n\n" +

                    "Code: " +
                    (
                        error.code ||
                        "N/A"
                    ) +

                    "\n\nDescription: " +
                    (
                        error.description ||
                        "N/A"
                    ) +

                    "\n\nSource: " +
                    (
                        error.source ||
                        "N/A"
                    ) +

                    "\n\nStep: " +
                    (
                        error.step ||
                        "N/A"
                    ) +

                    "\n\nReason: " +
                    (
                        error.reason ||
                        "N/A"
                    )
                )
            }
        )


        rzp.on(
            "payment.authorized",
            function (
                response
            ) {

                console.log(
                    "PAYMENT AUTHORIZED:",
                    response
                )
            }
        )


        rzp.on(
            "payment.captured",
            function (
                response
            ) {

                console.log(
                    "PAYMENT CAPTURED:",
                    response
                )
            }
        )


        rzp.open()
    }


    // ==================================================
    // CREATE RAZORPAY ORDER
    // ==================================================

    const appointmentRazorpay =
        async (
            appointmentId
        ) => {

            try {

                console.log(
                    "Creating Razorpay order..."
                )


                const {
                    data
                } = await axios.post(

                    backendUrl +
                    '/api/user/payment-razorpay',

                    {
                        appointmentId
                    },

                    {
                        headers: {
                            token
                        }
                    }
                )


                console.log(
                    "RAZORPAY ORDER RESPONSE:",
                    data
                )


                if (
                    data.success
                ) {

                    initPay(
                        data.order
                    )

                } else {

                    toast.error(
                        data.message ||
                        "Unable to create Razorpay order"
                    )
                }

            } catch (error) {

                console.error(
                    "CREATE RAZORPAY ORDER ERROR:",
                    error.response?.data ||
                    error
                )

                toast.error(

                    error.response?.data?.message ||

                    error.message ||

                    "Unable to start payment"
                )
            }
        }


    // ==================================================
    // STRIPE
    // ==================================================

    const appointmentStripe =
        async (
            appointmentId
        ) => {

            try {

                const {
                    data
                } = await axios.post(

                    backendUrl +
                    '/api/user/payment-stripe',

                    {
                        appointmentId
                    },

                    {
                        headers: {
                            token
                        }
                    }
                )


                if (
                    data.success
                ) {

                    window.location.replace(
                        data.session_url
                    )

                } else {

                    toast.error(
                        data.message
                    )
                }

            } catch (error) {

                console.error(
                    "STRIPE ERROR:",
                    error.response?.data ||
                    error
                )

                toast.error(
                    error.response?.data?.message ||
                    error.message
                )
            }
        }


    useEffect(
        () => {

            if (token) {
                getUserAppointments()
            }

        },
        [token]
    )


    return (

        <div>

            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>
                My appointments
            </p>


            <div>

                {appointments.map(
                    (
                        item,
                        index
                    ) => (

                        <div
                            key={index}
                            className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'
                        >

                            <div>

                                <img
                                    className='w-36 bg-[#EAEFFF]'
                                    src={
                                        item.docData.image
                                    }
                                    alt=""
                                />

                            </div>


                            <div className='flex-1 text-sm text-[#5E5E5E]'>

                                <p className='text-[#262626] text-base font-semibold'>
                                    {
                                        item.docData.name
                                    }
                                </p>

                                <p>
                                    {
                                        item.docData.speciality
                                    }
                                </p>

                                <p className='text-[#464646] font-medium mt-1'>
                                    Address:
                                </p>

                                <p>
                                    {
                                        item.docData.address.line1
                                    }
                                </p>

                                <p>
                                    {
                                        item.docData.address.line2
                                    }
                                </p>

                                <p className='mt-1'>

                                    <span className='text-sm text-[#3C3C3C] font-medium'>
                                        Date & Time:
                                    </span>

                                    {' '}

                                    {
                                        slotDateFormat(
                                            item.slotDate
                                        )
                                    }

                                    {' | '}

                                    {
                                        item.slotTime
                                    }

                                </p>

                            </div>


                            <div></div>


                            <div className='flex flex-col gap-2 justify-end text-sm text-center'>

                                {
                                    !item.cancelled &&
                                    !item.payment &&
                                    !item.isCompleted &&
                                    payment !== item._id && (

                                        <button
                                            onClick={() =>
                                                setPayment(
                                                    item._id
                                                )
                                            }
                                            className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
                                        >
                                            Pay Online
                                        </button>
                                    )
                                }


                                {
                                    !item.cancelled &&
                                    !item.payment &&
                                    !item.isCompleted &&
                                    payment === item._id && (

                                        <button
                                            onClick={() =>
                                                appointmentStripe(
                                                    item._id
                                                )
                                            }
                                            className='text-[#696969] sm:min-w-48 py-2 border rounded flex items-center justify-center'
                                        >

                                            <img
                                                className='max-w-20 max-h-5'
                                                src={
                                                    assets.stripe_logo
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
                                    payment === item._id && (

                                        <button
                                            onClick={() =>
                                                appointmentRazorpay(
                                                    item._id
                                                )
                                            }
                                            className='text-[#696969] sm:min-w-48 py-2 border rounded flex items-center justify-center'
                                        >

                                            <img
                                                className='max-w-20 max-h-5'
                                                src={
                                                    assets.razorpay_logo
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
                                            className='sm:min-w-48 py-2 border rounded text-[#696969] bg-[#EAEFFF]'
                                        >
                                            Paid
                                        </button>
                                    )
                                }


                                {
                                    item.isCompleted && (

                                        <button
                                            className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'
                                        >
                                            Completed
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
                                            className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
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
                                            className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                                        >
                                            Cancel appointment
                                        </button>
                                    )
                                }


                                {
                                    item.cancelled &&
                                    !item.isCompleted && (

                                        <button
                                            className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'
                                        >
                                            Appointment cancelled
                                        </button>
                                    )
                                }

                            </div>

                        </div>
                    )
                )}

            </div>

        </div>
    )
}


export default MyAppointments