import { ACCESS_TOKEN, EXPIRES_IN, TOKEN_TYPE } from "./common";
import { logout } from "./common";

const BASE_API_URL = import.meta.env.VITE_API_URL;

const getAccessToken = ()=>{

    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const expiresIn = localStorage.getItem(EXPIRES_IN);
    const tokenType = localStorage.getItem(TOKEN_TYPE);
    if(Date.now()<expiresIn){
        return {accessToken,tokenType}
    }else{
        logout();
     }
}
const createAPIConfig =({accessToken,tokenType})=>{
    
    return{headers:
        {
            Authorization:`${tokenType} ${accessToken}`
        },
    method:'GET'}
}

export const fetchRequest=async(endpoint)=>{

    const url = `${BASE_API_URL}/${endpoint}`;
    const result = await fetch(url,createAPIConfig(getAccessToken()));
    return await result.json();
}