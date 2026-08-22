import React, {
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

import axios
    from "axios";

import {
    AppContext
} from "../context/AppContext";


const AIAssistant = () => {

    const {
        backendUrl
    } = useContext(
        AppContext
    );


    const [
        open,
        setOpen
    ] = useState(false);


    const [
        message,
        setMessage
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        messages,
        setMessages
    ] = useState([

        {
            role:
                "assistant",

            content:
                "Hi! I'm the Prescripto Assistant. I can help you find the right type of doctor, understand appointments, payments, reviews and other Prescripto features."
        }

    ]);


    const messagesEndRef =
        useRef(null);


    const quickQuestions = [

        "Which doctor treats skin problems?",

        "How do I book an appointment?",

        "How do I reschedule?",

        "Show available doctors"
    ];


    const scrollToBottom = () => {

        messagesEndRef
            .current
            ?.scrollIntoView({
                behavior:
                    "smooth"
            });
    };


    useEffect(() => {

        scrollToBottom();

    }, [
        messages,
        loading
    ]);


    const sendMessage =
    async (
        customMessage = null
    ) => {

        const text =
            (
                customMessage ??
                message
            )
                .trim();


        if (
            !text ||
            loading
        ) {

            return;
        }


        const newUserMessage = {

            role:
                "user",

            content:
                text
        };


        const previousMessages =
            [...messages];


        setMessages(
            prev => [
                ...prev,
                newUserMessage
            ]
        );


        setMessage("");

        setLoading(true);


        try {

            const history =
                previousMessages
                    .filter(
                        item =>
                            item.role ===
                            "user" ||
                            item.role ===
                            "assistant"
                    )
                    .slice(-8);


            const {
                data
            } = await axios.post(

                backendUrl +
                "/api/ai/chat",

                {
                    message:
                        text,

                    history
                }
            );


            if (
                data.success
            ) {

                setMessages(
                    prev => [

                        ...prev,

                        {
                            role:
                                "assistant",

                            content:
                                data.reply
                        }
                    ]
                );

            } else {

                setMessages(
                    prev => [

                        ...prev,

                        {
                            role:
                                "assistant",

                            content:
                                data.message ||
                                "Sorry, I couldn't answer that right now."
                        }
                    ]
                );
            }

        } catch (error) {

            console.error(
                "AI CHAT ERROR:",
                error
            );


            const errorMessage =
                error.response
                    ?.status ===
                429
                    ? "The free AI usage limit has been reached for now. Please try again later."
                    : error.response
                        ?.data
                        ?.message ||
                      "The AI assistant is temporarily unavailable. Please try again.";


            setMessages(
                prev => [

                    ...prev,

                    {
                        role:
                            "assistant",

                        content:
                            errorMessage
                    }
                ]
            );

        } finally {

            setLoading(false);
        }
    };


    const handleKeyDown =
    event => {

        if (
            event.key ===
            "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    };


    const clearChat = () => {

        setMessages([

            {
                role:
                    "assistant",

                content:
                    "Hi! I'm the Prescripto Assistant. How can I help you?"
            }

        ]);
    };


    return (

        <>

            {
                open && (

                    <div
                        className="
                            fixed
                            bottom-24
                            right-4
                            sm:right-8
                            w-[calc(100%-2rem)]
                            sm:w-[380px]
                            h-[560px]
                            max-h-[72vh]
                            bg-white
                            rounded-2xl
                            shadow-2xl
                            border
                            border-gray-200
                            z-[999]
                            flex
                            flex-col
                            overflow-hidden
                        "
                    >


                        <div
                            className="
                                bg-primary
                                text-white
                                px-4
                                py-4
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        w-10
                                        h-10
                                        bg-white
                                        text-primary
                                        rounded-full
                                        flex
                                        items-center
                                        justify-center
                                        text-xl
                                    "
                                >
                                    ✦
                                </div>


                                <div>

                                    <p
                                        className="
                                            font-semibold
                                        "
                                    >
                                        Prescripto AI
                                    </p>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-1
                                            text-xs
                                            text-white/80
                                        "
                                    >

                                        <span
                                            className="
                                                w-2
                                                h-2
                                                bg-green-300
                                                rounded-full
                                            "
                                        ></span>

                                        AI Assistant

                                    </div>

                                </div>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <button
                                    onClick={
                                        clearChat
                                    }
                                    title="Clear chat"
                                    className="
                                        text-white/80
                                        hover:text-white
                                        px-2
                                    "
                                >
                                    ↻
                                </button>


                                <button
                                    onClick={() =>
                                        setOpen(
                                            false
                                        )
                                    }
                                    className="
                                        text-white
                                        text-2xl
                                        leading-none
                                    "
                                >
                                    ×
                                </button>

                            </div>

                        </div>


                        <div
                            className="
                                bg-yellow-50
                                border-b
                                border-yellow-100
                                px-4
                                py-2
                                text-[11px]
                                text-yellow-800
                            "
                        >
                            This assistant provides general guidance only and does not diagnose medical conditions.
                        </div>


                        <div
                            className="
                                flex-1
                                overflow-y-auto
                                p-4
                                bg-gray-50
                            "
                        >

                            {
                                messages.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                index
                                            }
                                            className={`
                                                flex
                                                mb-3

                                                ${
                                                    item.role ===
                                                    "user"
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }
                                            `}
                                        >

                                            <div
                                                className={`
                                                    max-w-[85%]
                                                    px-4
                                                    py-2.5
                                                    rounded-2xl
                                                    text-sm
                                                    leading-6
                                                    whitespace-pre-wrap

                                                    ${
                                                        item.role ===
                                                        "user"
                                                            ? "bg-primary text-white rounded-br-md"
                                                            : "bg-white text-gray-700 border border-gray-200 rounded-bl-md"
                                                    }
                                                `}
                                            >
                                                {
                                                    item.content
                                                }
                                            </div>

                                        </div>
                                    )
                                )
                            }


                            {
                                loading && (

                                    <div
                                        className="
                                            flex
                                            justify-start
                                            mb-3
                                        "
                                    >

                                        <div
                                            className="
                                                bg-white
                                                border
                                                rounded-2xl
                                                rounded-bl-md
                                                px-4
                                                py-3
                                                flex
                                                gap-1
                                            "
                                        >

                                            <span
                                                className="
                                                    animate-bounce
                                                "
                                            >
                                                •
                                            </span>

                                            <span
                                                className="
                                                    animate-bounce
                                                    [animation-delay:100ms]
                                                "
                                            >
                                                •
                                            </span>

                                            <span
                                                className="
                                                    animate-bounce
                                                    [animation-delay:200ms]
                                                "
                                            >
                                                •
                                            </span>

                                        </div>

                                    </div>
                                )
                            }


                            <div
                                ref={
                                    messagesEndRef
                                }
                            ></div>

                        </div>


                        {
                            messages.length <=
                            1 && (

                                <div
                                    className="
                                        px-3
                                        py-2
                                        border-t
                                        bg-white
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-gray-400
                                            mb-2
                                        "
                                    >
                                        Try asking:
                                    </p>


                                    <div
                                        className="
                                            flex
                                            gap-2
                                            overflow-x-auto
                                            pb-1
                                        "
                                    >

                                        {
                                            quickQuestions.map(
                                                question => (

                                                    <button
                                                        key={
                                                            question
                                                        }
                                                        onClick={() =>
                                                            sendMessage(
                                                                question
                                                            )
                                                        }
                                                        className="
                                                            text-xs
                                                            text-primary
                                                            border
                                                            border-primary/30
                                                            rounded-full
                                                            px-3
                                                            py-1.5
                                                            whitespace-nowrap
                                                            hover:bg-primary
                                                            hover:text-white
                                                            transition-all
                                                        "
                                                    >
                                                        {
                                                            question
                                                        }
                                                    </button>
                                                )
                                            )
                                        }

                                    </div>

                                </div>
                            )
                        }


                        <div
                            className="
                                border-t
                                bg-white
                                p-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-end
                                    gap-2
                                "
                            >

                                <textarea
                                    value={
                                        message
                                    }
                                    onChange={
                                        event =>
                                            setMessage(
                                                event.target.value
                                            )
                                    }
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    rows="1"
                                    maxLength={
                                        1000
                                    }
                                    placeholder="Ask Prescripto AI..."
                                    disabled={
                                        loading
                                    }
                                    className="
                                        flex-1
                                        resize-none
                                        border
                                        border-gray-300
                                        rounded-xl
                                        px-3
                                        py-2.5
                                        text-sm
                                        outline-primary
                                        max-h-24
                                    "
                                />


                                <button
                                    onClick={() =>
                                        sendMessage()
                                    }
                                    disabled={
                                        loading ||
                                        !message.trim()
                                    }
                                    className="
                                        bg-primary
                                        text-white
                                        w-11
                                        h-11
                                        rounded-xl
                                        flex
                                        items-center
                                        justify-center
                                        disabled:bg-gray-300
                                        transition-all
                                    "
                                >
                                    ➤
                                </button>

                            </div>

                        </div>

                    </div>
                )
            }


            <button
                onClick={() =>
                    setOpen(
                        prev =>
                            !prev
                    )
                }
                className="
                    fixed
                    bottom-6
                    right-4
                    sm:right-8
                    z-[999]
                    bg-primary
                    text-white
                    rounded-full
                    shadow-xl
                    w-14
                    h-14
                    sm:w-16
                    sm:h-16
                    flex
                    items-center
                    justify-center
                    hover:scale-105
                    transition-all
                "
                title="Prescripto AI Assistant"
            >

                {
                    open
                        ? (
                            <span
                                className="
                                    text-2xl
                                "
                            >
                                ×
                            </span>
                        )
                        : (
                            <span
                                className="
                                    text-2xl
                                "
                            >
                                ✦
                            </span>
                        )
                }

            </button>

        </>
    );
};


export default AIAssistant;