import { Link } from "react-router-dom"
import AuthenticationForm from "../components/authenticationform/authentication-form";

const AuthenticationPage = ({ type }) => {
  return (
    <div className="authentication-page flex justify-center items-center min-h-[80vh]">
        <AuthenticationForm type={type}/>

    </div>
  )
};

export default AuthenticationPage;