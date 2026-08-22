# Prescripto - AI Integrated Doctor Appointment Platform

Prescripto is a full-stack doctor appointment booking platform built using the MERN stack. It allows patients to search for doctors, book and manage appointments, make online payments, receive email confirmations, submit doctor reviews, and interact with an AI-powered healthcare assistant.

The application also includes separate Admin and Doctor dashboards for managing doctors, appointments, schedules, availability, and patients.

## Live Demo

Frontend:
Add your Vercel frontend link here

Backend API:
Add your Render backend link here

Admin Panel:
Add your Admin Vercel link here

## Features

### Patient Features

- User registration and login
- Secure authentication using JWT
- Patient profile management
- Search doctors by name or speciality
- Filter doctors by speciality
- Filter available doctors
- Sort doctors by:
  - Consultation fee
  - Name
  - Rating
- View doctor details
- View doctor ratings and patient reviews
- View doctor-specific working days and timings
- View available appointment slots
- Book doctor appointments
- Reschedule appointments
- Cancel appointments
- Online payment using Razorpay
- Stripe payment integration
- Appointment history
- Automated appointment confirmation emails
- Appointment cancellation emails
- Appointment rescheduling emails
- Submit doctor reviews and ratings after completed appointments
- AI-powered healthcare assistant
- Installable Progressive Web App (PWA)

### Doctor Features

- Doctor login
- Doctor dashboard
- View appointments
- View patient information
- Mark appointments as completed
- Cancel appointments
- Update profile information
- Update consultation fee
- Enable or disable appointment availability
- Configure working days
- Configure individual working hours
- Add leave / unavailable dates
- View earnings
- View appointment statistics
- View patient statistics

### Admin Features

- Admin authentication
- Add doctors
- Manage doctors
- View all appointments
- Cancel appointments
- Manage doctor availability
- View dashboard statistics

## AI Assistant

Prescripto includes an AI-powered assistant integrated using the OpenRouter API.

The assistant can:

- Help users understand which medical speciality may be suitable for their concern
- Recommend relevant doctors available on Prescripto
- Answer questions about booking appointments
- Explain appointment cancellation and rescheduling
- Explain online payments
- Explain reviews and ratings
- Answer general questions about using the platform

The AI assistant receives current doctor information from the backend so that recommendations can be based on doctors available in the application.

For safety, the assistant is designed to provide general guidance only and does not diagnose medical conditions or prescribe medicines.

## Reviews and Ratings

Patients can review doctors only after their appointments have been completed.

The review system includes:

- 1 to 5 star ratings
- Written patient reviews
- One review per completed appointment
- Average doctor rating calculation
- Total review count
- Doctor rating display on doctor cards
- Patient reviews displayed on doctor profile pages

## Doctor Scheduling System

Doctors can manage their own appointment schedule from the Doctor Panel.

Doctors can:

- Select working days
- Set different start and end times for each day
- Mark specific dates as leave
- Disable appointment availability

Patients automatically see only valid and available appointment slots.

## Email Notifications

Transactional appointment emails are implemented using Brevo.

Emails are automatically sent when:

- An appointment is booked
- An appointment is rescheduled
- An appointment is cancelled

## Progressive Web App

Prescripto is configured as a Progressive Web App.

Users can install Prescripto on supported desktop and mobile devices and open it like a standalone application.

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- React Toastify

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication

- JSON Web Token
- bcrypt

### Payments

- Razorpay
- Stripe

### Cloud Services

- Cloudinary - image storage
- Brevo - transactional email
- OpenRouter - AI assistant
- MongoDB Atlas - database
- Vercel - frontend deployment
- Render - backend deployment

## Project Architecture

```text
Prescripto
│
├── frontend
│   ├── components
│   ├── pages
│   ├── context
│   └── assets
│
├── admin
│   ├── components
│   ├── pages
│   ├── context
│   └── assets
│
└── backend
    ├── config
    ├── controllers
    ├── middleware
    ├── models
    ├── routes
    └── server.js
