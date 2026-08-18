import axios from 'axios';
import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Verify = () => {

    const [searchParams] = useSearchParams()

    const sessionId = searchParams.get("session_id")

    const { backendUrl, token } = useContext(AppContext)

    const navigate = useNavigate()

    const verifyStripe = async () => {

        try {

            if (!sessionId) {
                toast.error("Invalid payment session")
                navigate("/my-appointments")
                return
            }

            const { data } = await axios.post(
                backendUrl + "/api/user/verifyStripe",
                {
                    sessionId
                },
                {
                    headers: { token }
                }
            )

            if (data.success) {

                toast.success(data.message)

            } else {

                toast.error(data.message)

            }

            navigate("/my-appointments")

        } catch (error) {

            console.log(error)
            toast.error(error.message)
            navigate("/my-appointments")

        }

    }

    useEffect(() => {

        if (token && sessionId) {
            verifyStripe()
        }

    }, [token, sessionId])

    return (

        <div className="min-h-[60vh] flex items-center justify-center">

            <div className="w-20 h-20 border-4 border-gray-300 border-t-4 border-t-primary rounded-full animate-spin"></div>

        </div>

    )
}

export default Verify