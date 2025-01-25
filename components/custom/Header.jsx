import Image from 'next/image'
import React, { useContext } from 'react'
import { Button } from '../ui/button'
import Colors from '@/data/Colors'
import { UserDetailContext } from '@/context/UserDetailContext'
import Link from 'next/link'
import { useSidebar } from '../ui/sidebar'
import { ActionContext } from '@/context/ActionContext'
import { usePathname } from 'next/navigation'
import { LucideDownload, Rocket } from 'lucide-react'
import { useMutation } from 'convex/react'
import { useGoogleLogin } from '@react-oauth/google'
import { api } from '@/convex/_generated/api'
import axios from 'axios'
import uuid4 from 'uuid4'

function Header() {
  const {userDetail, setUserDetail}= useContext(UserDetailContext);
  const {toggleSidebar} = useSidebar();
  const {action, setAction} = useContext(ActionContext);
  const path = usePathname();
  console.log(path?.includes('workspace'));
  const createUser = useMutation(api.users.createUser);

  const onActionBtn = (action) => {
     
    setAction({
      actionType: action,
      timeStamp: Date.now()
    })
  }

    const googleLogin = useGoogleLogin({
        onSuccess: async tokenResponse => {
            console.log(tokenResponse)
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

            //save this on the local storage too 
            if(typeof window !== 'undefined'){
               localStorage.setItem('user',JSON.stringify(user))
            }

            setUserDetail(userInfo?.data);
            
            //save this inside the database

            
        },
        onError: errorResponse => console.log(errorResponse),
        
    })
  
  return (
    <div className='p-4 flex justify-between items-center border-b '>
       <Link href={"/"}>
        <Image src={'/logo.png'} alt='Logo' width={40} height={40} />
        </Link>
        {
         !userDetail?.name ?
         <div className='flex gap-5' >
            <Button onClick={googleLogin} variant='ghost' >Sign In</Button>
            <Button onClick={googleLogin} className='text-white' style={{backgroundColor: Colors.BLUE }} >Get Started</Button>
        </div> : 
        path?.includes('workspace') && <div className='flex gap-2 items-center'>
          <Button 
           variant="ghost" 
           onClick={()=> onActionBtn('export') } >
           <LucideDownload /> Export 
          </Button>

          <Button 
            className="bg-blue-500 text-white hover:bg-blue-600 " 
            onClick={()=> onActionBtn('deploy') }>
            <Rocket /> Deploy 
          </Button>

          {
            userDetail && 
              <Image src={userDetail?.picture} alt='user' width={30} height={30} 
                className='rounded-full w-[30px]'
                onClick={toggleSidebar}
              />
          }
            
        </div>
        }
    </div>
  )
}

export default Header