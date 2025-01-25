import React, { useContext } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import Lookup from '@/data/Lookup'
import { Button } from '../ui/button'
import { useGoogleLogin } from '@react-oauth/google'
import { UserDetailContext } from '@/context/UserDetailContext'
import axios from 'axios'
import { useConvex, useMutation } from 'convex/react'
import uuid4 from 'uuid4'
import { api } from '@/convex/_generated/api'

function SignInDialog({openDialog, closeDialog}) {
    
    const {userDetail,setUserDetail}= useContext(UserDetailContext);
    const createUser = useMutation(api.users.createUser);
    const convex = useConvex();
    
    const getUserFromDb = async(email) => {
      const result = await convex.query(api.users.getUser,{
        email: email
      });
      return result
    }

    const googleLogin = useGoogleLogin({
        onSuccess: async tokenResponse => {
           // console.log(tokenResponse)
            const userInfo = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: 
                    {
                        Authorization: `Bearer ${tokenResponse.access_token}`
                    }
                }
            );

            console.log(userInfo);

            const user = userInfo?.data;

            await createUser({
               name: user?.name,
               email: user?.email,
               picture: user?.picture,
               uid: uuid4()
            })

            const convexUser = await getUserFromDb(user?.email);

            const userData = {
              ...user,
              _id: convexUser?._id,
              token: convexUser?.token
            }

            //save this on the local storage too 
            if(typeof window !== 'undefined'){
               localStorage.setItem('user',JSON.stringify(user))
            }

            setUserDetail(userData);

            closeDialog(false);

            
        },
        onError: errorResponse => console.log("The error in googleLogin function is :  ",errorResponse),
        
    });

    const handleGoogleLogin = (e) => {
      e.preventDefault();
      googleLogin();
    }


  return (
    <Dialog open={openDialog} onOpenChange={closeDialog} >
    <DialogContent>
        <DialogHeader>
        <DialogTitle></DialogTitle>
        <DialogDescription  >
          <div className = "flex flex-col items-center justify-center gap-3" >  
            <h2 className='font-bold text-2xl text-center text-white ' >{Lookup.SIGNIN_HEADING} </h2>
            <p className='mt-2 text-center' >{Lookup.SIGNIN_SUBHEADING} </p>
            <Button
                 onClick= {handleGoogleLogin} 
                 className='bg-blue-500 text-white hover:bg-blue-400 mt-3 ' >
                 Sign In With Google 
            </Button>

            <p>{Lookup?.SIGNIn_AGREEMENT_TEXT} </p> 
          </div>  
        </DialogDescription>
        </DialogHeader>
    </DialogContent>
    </Dialog>

  )
}

export default SignInDialog