import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [aToken, setAToken] = useState(
        localStorage.getItem("aToken")
            ? localStorage.getItem("aToken")
            : ""
    );

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [dashData, setDashData] = useState(false);


    // =====================================================
    // GET ALL DOCTORS
    // =====================================================

    const getAllDoctors = async () => {

        try {

            const { data } = await axios.get(
                backendUrl + "/api/admin/all-doctors",
                {
                    headers: {
                        aToken
                    }
                }
            );

            if (data.success) {

                setDoctors(data.doctors);

            } else {

                toast.error(data.message);

            }

        } catch (error) {

            console.log(
                "GET ALL DOCTORS ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to get doctors"
            );
        }
    };


    // =====================================================
    // CHANGE DOCTOR AVAILABILITY
    // =====================================================

    const changeAvailability = async (docId) => {

        try {

            console.log(
                "================================="
            );

            console.log(
                "CHANGE DOCTOR AVAILABILITY"
            );

            console.log(
                "Doctor ID:",
                docId
            );

            console.log(
                "================================="
            );


            // Make sure an ID was actually supplied

            if (!docId) {

                toast.error(
                    "Doctor ID is missing"
                );

                return;
            }


            // IMPORTANT:
            // Backend expects:
            //
            // req.body.docId
            //
            // Therefore we send:
            //
            // { docId }

            const { data } = await axios.post(

                backendUrl +
                "/api/admin/change-availability",

                {
                    docId: docId
                },

                {
                    headers: {
                        aToken
                    }
                }

            );


            if (data.success) {

                toast.success(
                    data.message
                );

                // Refresh doctor list
                await getAllDoctors();

            } else {

                toast.error(
                    data.message
                );
            }


        } catch (error) {

            console.log(
                "================================="
            );

            console.log(
                "CHANGE AVAILABILITY ERROR"
            );

            console.log(
                "================================="
            );

            console.log(
                "Status:",
                error.response?.status
            );

            console.log(
                "Response:",
                error.response?.data
            );

            console.log(
                "Error:",
                error
            );


            toast.error(

                error.response?.data?.message ||

                error.message ||

                "Failed to change availability"

            );
        }
    };


    // =====================================================
    // REMOVE DOCTOR
    // =====================================================

    const removeDoctor = async (docId) => {

        try {

            console.log(
                "================================="
            );

            console.log(
                "REMOVE DOCTOR"
            );

            console.log(
                "Doctor ID:",
                docId
            );

            console.log(
                "================================="
            );


            // Make sure an ID was supplied

            if (!docId) {

                toast.error(
                    "Doctor ID is missing"
                );

                return;
            }


            // IMPORTANT:
            // Backend expects:
            //
            // const { docId } = req.body
            //
            // Therefore we send:
            //
            // { docId }

            const { data } = await axios.post(

                backendUrl +
                "/api/admin/remove-doctor",

                {
                    docId: docId
                },

                {
                    headers: {
                        aToken
                    }
                }

            );


            if (data.success) {

                toast.success(
                    data.message
                );

                // Refresh doctor list
                await getAllDoctors();

            } else {

                toast.error(
                    data.message
                );
            }


        } catch (error) {

            console.log(
                "================================="
            );

            console.log(
                "REMOVE DOCTOR ERROR"
            );

            console.log(
                "================================="
            );

            console.log(
                "Status:",
                error.response?.status
            );

            console.log(
                "Response:",
                error.response?.data
            );

            console.log(
                "Error:",
                error
            );


            toast.error(

                error.response?.data?.message ||

                error.message ||

                "Failed to remove doctor"

            );
        }
    };


    // =====================================================
    // GET ALL APPOINTMENTS
    // =====================================================

    const getAllAppointments = async () => {

        try {

            const { data } = await axios.get(

                backendUrl +
                "/api/admin/appointments",

                {
                    headers: {
                        aToken
                    }
                }

            );


            if (data.success) {

                setAppointments(
                    [...data.appointments].reverse()
                );

            } else {

                toast.error(
                    data.message
                );
            }


        } catch (error) {

            console.log(
                "GET ALL APPOINTMENTS ERROR:",
                error
            );

            toast.error(

                error.response?.data?.message ||

                error.message ||

                "Failed to get appointments"

            );
        }
    };


    // =====================================================
    // CANCEL APPOINTMENT
    // =====================================================

    const cancelAppointment = async (appointmentId) => {

        try {

            if (!appointmentId) {

                toast.error(
                    "Appointment ID is missing"
                );

                return;
            }


            const { data } = await axios.post(

                backendUrl +
                "/api/admin/cancel-appointment",

                {
                    appointmentId: appointmentId
                },

                {
                    headers: {
                        aToken
                    }
                }

            );


            if (data.success) {

                toast.success(
                    data.message
                );

                await getAllAppointments();

            } else {

                toast.error(
                    data.message
                );
            }


        } catch (error) {

            console.log(
                "CANCEL APPOINTMENT ERROR:",
                error
            );

            toast.error(

                error.response?.data?.message ||

                error.message ||

                "Failed to cancel appointment"

            );
        }
    };


    // =====================================================
    // GET DASHBOARD DATA
    // =====================================================

    const getDashData = async () => {

        try {

            const { data } = await axios.get(

                backendUrl +
                "/api/admin/dashboard",

                {
                    headers: {
                        aToken
                    }
                }

            );


            if (data.success) {

                setDashData(
                    data.dashData
                );

            } else {

                toast.error(
                    data.message
                );
            }


        } catch (error) {

            console.log(
                "GET DASHBOARD ERROR:",
                error
            );

            toast.error(

                error.response?.data?.message ||

                error.message ||

                "Failed to get dashboard data"

            );
        }
    };


    // =====================================================
    // CONTEXT VALUE
    // =====================================================

    const value = {

        aToken,
        setAToken,

        doctors,
        getAllDoctors,

        changeAvailability,
        removeDoctor,

        appointments,
        getAllAppointments,
        cancelAppointment,

        getDashData,
        dashData

    };


    return (

        <AdminContext.Provider value={value}>

            {props.children}

        </AdminContext.Provider>

    );
};


export default AdminContextProvider;