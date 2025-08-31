import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Components/useAuth";

const PrivateRoute = ({children}) => {
    const {user, loading} = useAuth()
    const location = useLocation();
    console.log(location)
    
    if(loading){
        return <div>Loading..</div>
    }
    if(user){
        return children;
    }
    return (<Navigate to='/login' state={{from: location}} replace></Navigate>
    );
};

export default PrivateRoute;