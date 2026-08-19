import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddDoctor = () => {

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {

            if (!docImg) {
                toast.error('Image Not Selected')
                return
            }

            if (!aToken) {
                toast.error('Admin authentication token missing')
                console.error('ADMIN TOKEN MISSING')
                return
            }

            if (!backendUrl) {
                toast.error('Backend URL is missing')
                console.error('BACKEND URL MISSING')
                return
            }

            const formData = new FormData()

            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', String(Number(fees)))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)

            formData.append(
                'address',
                JSON.stringify({
                    line1: address1,
                    line2: address2
                })
            )

            console.log('========== ADD DOCTOR REQUEST ==========')
            console.log('Backend URL:', backendUrl)
            console.log('Endpoint:', `${backendUrl}/api/admin/add-doctor`)
            console.log('Image:', {
                name: docImg.name,
                size: docImg.size,
                type: docImg.type
            })
            console.log('Token exists:', !!aToken)

            formData.forEach((value, key) => {
                if (value instanceof File) {
                    console.log(`${key}:`, {
                        name: value.name,
                        size: value.size,
                        type: value.type
                    })
                } else {
                    console.log(`${key}:`, value)
                }
            })

            console.log('========================================')

            const response = await axios.post(
                `${backendUrl}/api/admin/add-doctor`,
                formData,
                {
                    headers: {
                        aToken: aToken
                    }
                }
            )

            console.log('========== ADD DOCTOR RESPONSE ==========')
            console.log('Status:', response.status)
            console.log('Response:', response.data)
            console.log('=========================================')

            const data = response.data

            if (data.success) {

                toast.success(data.message)

                setDocImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setAddress1('')
                setAddress2('')
                setDegree('')
                setAbout('')
                setFees('')

            } else {
                toast.error(data.message || 'Failed to add doctor')
            }

        } catch (error) {

            console.error('========== ADD DOCTOR FAILED ==========')
            console.error('Message:', error?.message)
            console.error('Status:', error?.response?.status)
            console.error('Response:', error?.response?.data)
            console.error('Headers:', error?.response?.headers)
            console.error('Full error:', error)
            console.error('========================================')

            const serverMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Failed to add doctor'

            toast.error(serverMessage)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>

            <p className='mb-3 text-lg font-medium'>Add Doctor</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>

                <div className='flex items-center gap-4 mb-8 text-gray-500'>

                    <label htmlFor="doc-img">
                        <img
                            className='w-16 bg-gray-100 rounded-full cursor-pointer'
                            src={
                                docImg
                                    ? URL.createObjectURL(docImg)
                                    : assets.upload_area
                            }
                            alt=""
                        />
                    </label>

                    <input
                        onChange={(e) => {
                            const file = e.target.files?.[0]

                            if (!file) {
                                return
                            }

                            console.log('Selected image:', {
                                name: file.name,
                                size: file.size,
                                type: file.type
                            })

                            setDocImg(file)
                        }}
                        type="file"
                        accept="image/*"
                        name="image"
                        id="doc-img"
                        hidden
                    />

                    <p>
                        Upload doctor
                        <br />
                        picture
                    </p>

                </div>

                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Your name</p>
                            <input
                                onChange={e => setName(e.target.value)}
                                value={name}
                                className='border rounded px-3 py-2'
                                type="text"
                                placeholder='Name'
                                required
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Email</p>
                            <input
                                onChange={e => setEmail(e.target.value)}
                                value={email}
                                className='border rounded px-3 py-2'
                                type="email"
                                placeholder='Email'
                                required
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Set Password</p>
                            <input
                                onChange={e => setPassword(e.target.value)}
                                value={password}
                                className='border rounded px-3 py-2'
                                type="password"
                                placeholder='Password'
                                required
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Experience</p>

                            <select
                                onChange={e => setExperience(e.target.value)}
                                value={experience}
                                className='border rounded px-2 py-2'
                            >
                                <option value="1 Year">1 Year</option>
                                <option value="2 Year">2 Years</option>
                                <option value="3 Year">3 Years</option>
                                <option value="4 Year">4 Years</option>
                                <option value="5 Year">5 Years</option>
                                <option value="6 Year">6 Years</option>
                                <option value="8 Year">8 Years</option>
                                <option value="9 Year">9 Years</option>
                                <option value="10 Year">10 Years</option>
                            </select>

                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Fees</p>

                            <input
                                onChange={e => setFees(e.target.value)}
                                value={fees}
                                className='border rounded px-3 py-2'
                                type="number"
                                placeholder='Doctor fees'
                                required
                            />
                        </div>

                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Speciality</p>

                            <select
                                onChange={e => setSpeciality(e.target.value)}
                                value={speciality}
                                className='border rounded px-2 py-2'
                            >
                                <option value="General physician">
                                    General physician
                                </option>

                                <option value="Gynecologist">
                                    Gynecologist
                                </option>

                                <option value="Dermatologist">
                                    Dermatologist
                                </option>

                                <option value="Pediatricians">
                                    Pediatricians
                                </option>

                                <option value="Neurologist">
                                    Neurologist
                                </option>

                                <option value="Gastroenterologist">
                                    Gastroenterologist
                                </option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Degree</p>

                            <input
                                onChange={e => setDegree(e.target.value)}
                                value={degree}
                                className='border rounded px-3 py-2'
                                type="text"
                                placeholder='Degree'
                                required
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address</p>

                            <input
                                onChange={e => setAddress1(e.target.value)}
                                value={address1}
                                className='border rounded px-3 py-2'
                                type="text"
                                placeholder='Address 1'
                                required
                            />

                            <input
                                onChange={e => setAddress2(e.target.value)}
                                value={address2}
                                className='border rounded px-3 py-2'
                                type="text"
                                placeholder='Address 2'
                                required
                            />
                        </div>

                    </div>

                </div>

                <div>

                    <p className='mt-4 mb-2'>About Doctor</p>

                    <textarea
                        onChange={e => setAbout(e.target.value)}
                        value={about}
                        className='w-full px-4 pt-2 border rounded'
                        rows={5}
                        placeholder='write about doctor'
                    />

                </div>

                <button
                    type='submit'
                    className='bg-primary px-10 py-3 mt-4 text-white rounded-full'
                >
                    Add doctor
                </button>

            </div>

        </form>
    )
}

export default AddDoctor