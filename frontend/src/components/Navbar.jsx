import React, {
  useContext,
  useEffect,
  useState
} from "react";

import {
  assets
} from "../assets/assets";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import {
  AppContext
} from "../context/AppContext";


const Navbar = () => {

  const navigate =
    useNavigate();

  const [
    showMenu,
    setShowMenu
  ] = useState(false);

  const [
    installPrompt,
    setInstallPrompt
  ] = useState(null);

  const [
    isInstalled,
    setIsInstalled
  ] = useState(false);


  const {
    token,
    setToken,
    userData
  } = useContext(
    AppContext
  );


  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    setToken(false);

    navigate(
      "/login"
    );
  };


  useEffect(() => {

    const handleBeforeInstallPrompt =
      event => {

        event.preventDefault();

        setInstallPrompt(
          event
        );
      };


    const handleAppInstalled = () => {

      setIsInstalled(
        true
      );

      setInstallPrompt(
        null
      );
    };


    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );


    if (
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches
    ) {

      setIsInstalled(
        true
      );
    }


    return () => {

      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };

  }, []);


  const installApp =
    async () => {

      if (!installPrompt) {

        return;
      }


      installPrompt.prompt();


      const result =
        await installPrompt
          .userChoice;


      if (
        result.outcome ===
        "accepted"
      ) {

        console.log(
          "Prescripto installation accepted"
        );

      } else {

        console.log(
          "Prescripto installation cancelled"
        );
      }


      setInstallPrompt(
        null
      );
    };


  return (

    <div
      className="
        flex
        items-center
        justify-between
        text-sm
        py-4
        mb-5
        border-b
        border-b-[#ADADAD]
      "
    >


      <img
        onClick={() =>
          navigate("/")
        }
        className="
          w-44
          cursor-pointer
        "
        src={
          assets.logo
        }
        alt="Prescripto"
      />


      <ul
        className="
          md:flex
          items-start
          gap-5
          font-medium
          hidden
        "
      >


        <NavLink to="/">

          <li
            className="
              py-1
            "
          >
            HOME
          </li>

          <hr
            className="
              border-none
              outline-none
              h-0.5
              bg-primary
              w-3/5
              m-auto
              hidden
            "
          />

        </NavLink>


        <NavLink
          to="/doctors"
        >

          <li
            className="
              py-1
            "
          >
            ALL DOCTORS
          </li>

          <hr
            className="
              border-none
              outline-none
              h-0.5
              bg-primary
              w-3/5
              m-auto
              hidden
            "
          />

        </NavLink>


        <NavLink
          to="/about"
        >

          <li
            className="
              py-1
            "
          >
            ABOUT
          </li>

          <hr
            className="
              border-none
              outline-none
              h-0.5
              bg-primary
              w-3/5
              m-auto
              hidden
            "
          />

        </NavLink>


        <NavLink
          to="/contact"
        >

          <li
            className="
              py-1
            "
          >
            CONTACT
          </li>

          <hr
            className="
              border-none
              outline-none
              h-0.5
              bg-primary
              w-3/5
              m-auto
              hidden
            "
          />

        </NavLink>


      </ul>


      <div
        className="
          flex
          items-center
          gap-3
        "
      >


        {
          installPrompt &&
          !isInstalled && (

            <button
              onClick={
                installApp
              }
              className="
                hidden
                md:block
                border
                border-primary
                text-primary
                px-4
                py-2
                rounded-full
                hover:bg-primary
                hover:text-white
                transition-all
              "
            >
              ↓ Install App
            </button>
          )
        }


        {
          token &&
          userData

            ? (

              <div
                className="
                  flex
                  items-center
                  gap-2
                  cursor-pointer
                  group
                  relative
                "
              >


                <img
                  className="
                    w-8
                    h-8
                    rounded-full
                    object-cover
                  "
                  src={
                    userData.image
                  }
                  alt=""
                />


                <img
                  className="
                    w-2.5
                  "
                  src={
                    assets.dropdown_icon
                  }
                  alt=""
                />


                <div
                  className="
                    absolute
                    top-0
                    right-0
                    pt-14
                    text-base
                    font-medium
                    text-gray-600
                    z-20
                    hidden
                    group-hover:block
                  "
                >

                  <div
                    className="
                      min-w-48
                      bg-gray-50
                      rounded
                      flex
                      flex-col
                      gap-4
                      p-4
                      shadow
                    "
                  >

                    <p
                      onClick={() =>
                        navigate(
                          "/my-profile"
                        )
                      }
                      className="
                        hover:text-black
                        cursor-pointer
                      "
                    >
                      My Profile
                    </p>


                    <p
                      onClick={() =>
                        navigate(
                          "/my-appointments"
                        )
                      }
                      className="
                        hover:text-black
                        cursor-pointer
                      "
                    >
                      My Appointments
                    </p>


                    <p
                      onClick={
                        logout
                      }
                      className="
                        hover:text-black
                        cursor-pointer
                      "
                    >
                      Logout
                    </p>

                  </div>

                </div>

              </div>

            )

            : (

              <button
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
                className="
                  bg-primary
                  text-white
                  px-8
                  py-3
                  rounded-full
                  font-light
                  hidden
                  md:block
                "
              >
                Create account
              </button>
            )
        }


        <img
          onClick={() =>
            setShowMenu(
              true
            )
          }
          className="
            w-6
            md:hidden
            cursor-pointer
          "
          src={
            assets.menu_icon
          }
          alt=""
        />


        <div
          className={`
            md:hidden

            ${
              showMenu
                ? "fixed w-full"
                : "h-0 w-0"
            }

            right-0
            top-0
            bottom-0
            z-20
            overflow-hidden
            bg-white
            transition-all
          `}
        >


          <div
            className="
              flex
              items-center
              justify-between
              px-5
              py-6
            "
          >

            <img
              src={
                assets.logo
              }
              className="
                w-36
              "
              alt=""
            />


            <img
              onClick={() =>
                setShowMenu(
                  false
                )
              }
              src={
                assets.cross_icon
              }
              className="
                w-7
                cursor-pointer
              "
              alt=""
            />

          </div>


          <ul
            className="
              flex
              flex-col
              items-center
              gap-2
              mt-5
              px-5
              text-lg
              font-medium
            "
          >


            <NavLink
              onClick={() =>
                setShowMenu(
                  false
                )
              }
              to="/"
            >

              <p
                className="
                  px-4
                  py-2
                  rounded
                  inline-block
                "
              >
                HOME
              </p>

            </NavLink>


            <NavLink
              onClick={() =>
                setShowMenu(
                  false
                )
              }
              to="/doctors"
            >

              <p
                className="
                  px-4
                  py-2
                  rounded
                  inline-block
                "
              >
                ALL DOCTORS
              </p>

            </NavLink>


            <NavLink
              onClick={() =>
                setShowMenu(
                  false
                )
              }
              to="/about"
            >

              <p
                className="
                  px-4
                  py-2
                  rounded
                  inline-block
                "
              >
                ABOUT
              </p>

            </NavLink>


            <NavLink
              onClick={() =>
                setShowMenu(
                  false
                )
              }
              to="/contact"
            >

              <p
                className="
                  px-4
                  py-2
                  rounded
                  inline-block
                "
              >
                CONTACT
              </p>

            </NavLink>


            {
              installPrompt &&
              !isInstalled && (

                <button
                  onClick={() => {

                    setShowMenu(
                      false
                    );

                    installApp();
                  }}
                  className="
                    mt-3
                    bg-primary
                    text-white
                    px-6
                    py-2.5
                    rounded-full
                    text-base
                  "
                >
                  ↓ Install Prescripto
                </button>
              )
            }


          </ul>

        </div>

      </div>

    </div>
  );
};


export default Navbar;