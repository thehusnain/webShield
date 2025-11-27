
import { createUser, verifyUser } from "../models/users-model.js";

export async function addUser(user){
    try {
        const result = await createUser(user);
        return result;
    } catch (error) {
        return { error: error.message };
    }
}

export async function checkUser(user){
    try {
        const result = await verifyUser(user);
        return result;
    } catch (error) {
        return { error: error.message };
    }
}