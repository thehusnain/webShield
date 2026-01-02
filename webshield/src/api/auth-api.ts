import api from "./axios";

export const signupUser = (data: {
  username: string;
  email: string;
  password: string;
}) => {
  return api.post("/user/signup", data);
};

export const LoginUser = (data : {
    email : string;
    password : string;
}) => {
    return api.post("/user/login", data)
}

export const LogoutUser = () => {
    return api.post("/user/logout")
}

export const Profile = () => {
    return api.get("user/profile")

}