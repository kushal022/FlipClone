/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector, } from 'react-redux'

const PrivateRoute = () => {
    const [ok, setOk] = useState(false);
    const { user, isLoading, token } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const authCheck = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/user-auth`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                res.data.success ? setOk(true) : setOk(false);
            } catch (error) {
                console.log(error);

                if (error.response.status === 401 && !isLoading) {
                    setTimeout(() => {
                        toast.error("Please Log in to access Details!", {
                            toastId: "userNotLoggedIn",
                        });
                        navigate("/login", {
                            state: location.pathname,
                        });
                    }, 500);
                }
            }
        };
        !isLoading && authCheck();
    }, [token, isLoading, location.pathname, navigate]);

    return ok ? <Outlet /> : <Spinner />;
};

export default PrivateRoute;
