const formatAppointmentDate = (slotDate) => {

    try {

        const [day, month, year] =
            slotDate.split("_");

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

        return slotDate;
    }
};


const sendAppointmentEmail = async ({
    to,
    userName,
    type,
    doctorName,
    speciality,
    slotDate,
    slotTime,
    amount
}) => {

    try {

        if (!process.env.BREVO_API_KEY) {

            console.error(
                "BREVO EMAIL ERROR: BREVO_API_KEY is missing"
            );

            return false;
        }


        if (!process.env.BREVO_SENDER_EMAIL) {

            console.error(
                "BREVO EMAIL ERROR: BREVO_SENDER_EMAIL is missing"
            );

            return false;
        }


        if (!to) {

            console.error(
                "BREVO EMAIL ERROR: Patient email is missing"
            );

            return false;
        }


        const formattedDate =
            formatAppointmentDate(
                slotDate
            );


        let subject = "";
        let title = "";
        let message = "";
        let statusColor = "#5f6FFF";


        if (type === "booked") {

            subject =
                "Appointment Confirmed - Prescripto";

            title =
                "Appointment Confirmed";

            message =
                "Your doctor appointment has been successfully booked.";

            statusColor =
                "#16a34a";
        }


        else if (
            type === "rescheduled"
        ) {

            subject =
                "Appointment Rescheduled - Prescripto";

            title =
                "Appointment Rescheduled";

            message =
                "Your appointment has been successfully rescheduled.";

            statusColor =
                "#5f6FFF";
        }


        else if (
            type === "cancelled"
        ) {

            subject =
                "Appointment Cancelled - Prescripto";

            title =
                "Appointment Cancelled";

            message =
                "Your appointment has been cancelled successfully.";

            statusColor =
                "#dc2626";
        }


        else {

            subject =
                "Appointment Update - Prescripto";

            title =
                "Appointment Update";

            message =
                "There has been an update to your appointment.";
        }


        const response =
            await fetch(
                "https://api.brevo.com/v3/smtp/email",
                {
                    method: "POST",

                    headers: {

                        accept:
                            "application/json",

                        "api-key":
                            process.env.BREVO_API_KEY,

                        "content-type":
                            "application/json"
                    },


                    body:
                        JSON.stringify({

                            sender: {

                                name:
                                    process.env.BREVO_SENDER_NAME ||
                                    "Prescripto",

                                email:
                                    process.env.BREVO_SENDER_EMAIL
                            },


                            to: [

                                {
                                    email:
                                        to,

                                    name:
                                        userName ||
                                        "Patient"
                                }

                            ],


                            subject,


                            htmlContent: `
                            <!DOCTYPE html>

                            <html>

                            <head>

                                <meta charset="UTF-8" />

                            </head>


                            <body
                                style="
                                    margin:0;
                                    padding:0;
                                    background-color:#f5f5f5;
                                    font-family:Arial, Helvetica, sans-serif;
                                "
                            >


                                <div
                                    style="
                                        max-width:600px;
                                        margin:30px auto;
                                        background:white;
                                        border-radius:12px;
                                        overflow:hidden;
                                        box-shadow:0 2px 10px rgba(0,0,0,0.08);
                                    "
                                >


                                    <div
                                        style="
                                            background:#5f6FFF;
                                            padding:25px;
                                            text-align:center;
                                            color:white;
                                        "
                                    >


                                        <h1
                                            style="
                                                margin:0;
                                                font-size:28px;
                                            "
                                        >

                                            Prescripto

                                        </h1>


                                        <p
                                            style="
                                                margin:8px 0 0;
                                            "
                                        >

                                            Doctor Appointment Platform

                                        </p>


                                    </div>



                                    <div
                                        style="
                                            padding:30px;
                                        "
                                    >


                                        <h2
                                            style="
                                                color:${statusColor};
                                                margin-top:0;
                                            "
                                        >

                                            ${title}

                                        </h2>


                                        <p
                                            style="
                                                color:#444;
                                                font-size:16px;
                                            "
                                        >

                                            Hello ${userName || "Patient"},

                                        </p>


                                        <p
                                            style="
                                                color:#555;
                                                line-height:1.6;
                                            "
                                        >

                                            ${message}

                                        </p>



                                        <div
                                            style="
                                                background:#f8f9ff;
                                                border-radius:10px;
                                                padding:20px;
                                                margin-top:25px;
                                            "
                                        >


                                            <p
                                                style="
                                                    margin:8px 0;
                                                "
                                            >

                                                <strong>
                                                    Doctor:
                                                </strong>

                                                ${doctorName || "Doctor"}

                                            </p>


                                            <p
                                                style="
                                                    margin:8px 0;
                                                "
                                            >

                                                <strong>
                                                    Speciality:
                                                </strong>

                                                ${speciality || "N/A"}

                                            </p>


                                            <p
                                                style="
                                                    margin:8px 0;
                                                "
                                            >

                                                <strong>
                                                    Date:
                                                </strong>

                                                ${formattedDate || "N/A"}

                                            </p>


                                            <p
                                                style="
                                                    margin:8px 0;
                                                "
                                            >

                                                <strong>
                                                    Time:
                                                </strong>

                                                ${slotTime || "N/A"}

                                            </p>


                                            ${
                                                amount
                                                    ? `
                                                    <p
                                                        style="
                                                            margin:8px 0;
                                                        "
                                                    >

                                                        <strong>
                                                            Consultation Fee:
                                                        </strong>

                                                        ₹${amount}

                                                    </p>
                                                    `
                                                    : ""
                                            }


                                        </div>



                                        ${
                                            type === "booked"
                                                ? `
                                                <p
                                                    style="
                                                        color:#666;
                                                        margin-top:25px;
                                                        line-height:1.5;
                                                    "
                                                >

                                                    Please arrive on time for your appointment.

                                                    You can manage your appointment from the

                                                    My Appointments section of Prescripto.

                                                </p>
                                                `
                                                : ""
                                        }



                                        ${
                                            type === "rescheduled"
                                                ? `
                                                <p
                                                    style="
                                                        color:#666;
                                                        margin-top:25px;
                                                    "
                                                >

                                                    Please note the updated appointment

                                                    date and time shown above.

                                                </p>
                                                `
                                                : ""
                                        }



                                        ${
                                            type === "cancelled"
                                                ? `
                                                <p
                                                    style="
                                                        color:#666;
                                                        margin-top:25px;
                                                    "
                                                >

                                                    The appointment slot has been released.

                                                    You can book another appointment anytime.

                                                </p>
                                                `
                                                : ""
                                        }



                                        <p
                                            style="
                                                color:#777;
                                                margin-top:30px;
                                                font-size:14px;
                                            "
                                        >

                                            Thank you for using Prescripto.

                                        </p>


                                    </div>



                                    <div
                                        style="
                                            background:#f5f5f5;
                                            padding:15px;
                                            text-align:center;
                                            color:#888;
                                            font-size:12px;
                                        "
                                    >

                                        This is an automated email from Prescripto.

                                    </div>


                                </div>


                            </body>

                            </html>
                            `
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "BREVO EMAIL ERROR:",
                data
            );

            return false;
        }


        console.log(
            "EMAIL SENT SUCCESSFULLY:",
            data.messageId
        );


        return true;


    } catch (error) {

        console.error(
            "BREVO EMAIL ERROR:",
            error.message
        );

        return false;
    }
};


export {
    sendAppointmentEmail
};