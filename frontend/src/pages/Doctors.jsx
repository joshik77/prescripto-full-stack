import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'

const Doctors = () => {

  const { speciality } = useParams()

  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [search, setSearch] = useState('')
  const [sortOption, setSortOption] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  const navigate = useNavigate()

  const { doctors, currencySymbol } = useContext(AppContext)

  const applyFilter = () => {

    let filteredDoctors = [...doctors]

    if (speciality) {
      filteredDoctors = filteredDoctors.filter(
        doc => doc.speciality === speciality
      )
    }

    if (search.trim()) {
      filteredDoctors = filteredDoctors.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.speciality.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (availableOnly) {
      filteredDoctors = filteredDoctors.filter(doc => doc.available)
    }

    if (sortOption === 'low-high') {
      filteredDoctors.sort((a, b) => a.fees - b.fees)
    }

    if (sortOption === 'high-low') {
      filteredDoctors.sort((a, b) => b.fees - a.fees)
    }

    if (sortOption === 'name-az') {
      filteredDoctors.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilterDoc(filteredDoctors)
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality, search, sortOption, availableOnly])

  const clearFilters = () => {
    setSearch('')
    setSortOption('')
    setAvailableOnly(false)
    navigate('/doctors')
  }

  return (
    <div>

      <p className='text-gray-600'>
        Browse through the doctors specialist.
      </p>

      <div className='mt-5 flex flex-col md:flex-row gap-3'>

        <input
          type='text'
          placeholder='Search doctor or speciality'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg outline-primary'
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg outline-primary'
        >
          <option value=''>Sort By</option>
          <option value='low-high'>Fees: Low to High</option>
          <option value='high-low'>Fees: High to Low</option>
          <option value='name-az'>Name: A to Z</option>
        </select>

        <button
          onClick={() => setAvailableOnly(!availableOnly)}
          className={`px-4 py-2 border rounded-lg transition-all ${
            availableOnly
              ? 'bg-primary text-white'
              : 'border-gray-300 text-gray-600'
          }`}
        >
          Available Only
        </button>

        <button
          onClick={clearFilters}
          className='px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100'
        >
          Clear
        </button>

      </div>

      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>

        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
            showFilter ? 'bg-primary text-white' : ''
          }`}
        >
          Filters
        </button>

        <div
          className={`flex-col gap-4 text-sm text-gray-600 ${
            showFilter ? 'flex' : 'hidden sm:flex'
          }`}
        >

          <p
            onClick={() =>
              speciality === 'General physician'
                ? navigate('/doctors')
                : navigate('/doctors/General physician')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'General physician'
                ? 'bg-[#E2E5FF] text-black'
                : ''
            }`}
          >
            General physician
          </p>

          <p
            onClick={() =>
              speciality === 'Gynecologist'
                ? navigate('/doctors')
                : navigate('/doctors/Gynecologist')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Gynecologist'
                ? 'bg-[#E2E5FF] text-black'
                : ''
            }`}
          >
            Gynecologist
          </p>

          <p
            onClick={() =>
              speciality === 'Dermatologist'
                ? navigate('/doctors')
                : navigate('/doctors/Dermatologist')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Dermatologist'
                ? 'bg-[#E2E5FF] text-black'
                : ''
            }`}
          >
            Dermatologist
          </p>

          <p
            onClick={() =>
              speciality === 'Pediatricians'
                ? navigate('/doctors')
                : navigate('/doctors/Pediatricians')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Pediatricians'
                ? 'bg-[#E2E5FF] text-black'
                : ''
            }`}
          >
            Pediatricians
          </p>

          <p
            onClick={() =>
              speciality === 'Neurologist'
                ? navigate('/doctors')
                : navigate('/doctors/Neurologist')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Neurologist'
                ? 'bg-[#E2E5FF] text-black'
                : ''
            }`}
          >
            Neurologist
          </p>

          <p
            onClick={() =>
              speciality === 'Gastroenterologist'
                ? navigate('/doctors')
                : navigate('/doctors/Gastroenterologist')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Gastroenterologist'
                ? 'bg-[#E2E5FF] text-black'
                : ''
            }`}
          >
            Gastroenterologist
          </p>

        </div>

        <div className='w-full'>

          {filterDoc.length === 0 && (
            <div className='text-center text-gray-500 mt-10'>
              <p className='text-lg'>No doctors found</p>
              <p className='text-sm mt-1'>
                Try changing your search or filters.
              </p>
            </div>
          )}

          <div className='grid grid-cols-auto gap-4 gap-y-6'>

            {filterDoc.map((item) => (

              <div
                onClick={() => {
                  navigate(`/appointment/${item._id}`)
                  scrollTo(0, 0)
                }}
                className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
                key={item._id}
              >

                <img
                  className='bg-[#EAEFFF]'
                  src={item.image}
                  alt={item.name}
                />

                <div className='p-4'>

                  <div
                    className={`flex items-center gap-2 text-sm ${
                      item.available
                        ? 'text-green-500'
                        : 'text-gray-500'
                    }`}
                  >
                    <p
                      className={`w-2 h-2 rounded-full ${
                        item.available
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      }`}
                    ></p>

                    <p>
                      {item.available
                        ? 'Available'
                        : 'Not Available'}
                    </p>
                  </div>

                  <p className='text-[#262626] text-lg font-medium'>
                    {item.name}
                  </p>

                  <p className='text-[#5C5C5C] text-sm'>
                    {item.speciality}
                  </p>

                  <p className='text-[#5C5C5C] text-sm mt-1'>
                    Consultation Fee: {currencySymbol}{item.fees}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  )
}

export default Doctors