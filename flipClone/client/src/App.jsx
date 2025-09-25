import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Layout from "./layouts/Layout";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchCart } from "./redux/asyncThunk/cart";

function App() {
    const { pathname } = useLocation();
    const auth = useSelector(s => s.auth)
    const dispatch = useDispatch()
    useEffect(()=>{
        dispatch(fetchCart())
    },[])

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }, [pathname]);
    return (
        <>
            <Layout />
        </>
    );
}

export default App;
