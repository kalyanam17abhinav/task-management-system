import {useContext, useState} from "react";
import {AuthContext} from "../context/AuthContext";

export default function Login(){
    const {login, register} = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            if (isRegistering) {
                await register({email, password});
            } else {
                await login({email, password});
            }
        } catch (err) {
            console.error('Registration/Login error:', err);
            setError(err.response?.data?.message || err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="loginDiv shadow-md h-[450px] w-[428px] rounded-xl border mx-auto mt-[128px] p-12 border-black">
        <form onSubmit = {handleSubmit} className="loginForm flex flex-col justify-center gap-y-6" autoComplete="off">
            <p className="loginTitle bg-[#1E90FF] text-center text-3xl">task manager</p>
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}
            <input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="loginEmail rounded-md p-2 border" 
                placeholder="enter email" 
                autoComplete="off"
                required
            />
            <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="loginPassword rounded-md p-2 border" 
                placeholder="enter password" 
                autoComplete="new-password"
                required
            />
            <button 
                type="submit" 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 h-12 w-32 rounded-3xl mx-auto text-white"
            >
                {loading ? 'Loading...' : (isRegistering ? 'Register' : 'Login')}
            </button>
            <button 
                type="button" 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-gray-600 hover:text-gray-700 underline text-sm border-none"
            >
                {isRegistering ? 'Already have an account? Login' : 'New user? Register here'}
            </button>
        </form>
        </div>
    );
}