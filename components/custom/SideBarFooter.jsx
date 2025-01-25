import { HelpCircle, LogOut, Settings, Wallet } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { useSidebar } from '../ui/sidebar';
import { toast } from 'sonner';
import useLogout from '@/configs/LogOut';

function SideBarFooter() {
    const router = useRouter();
    const {logOut} = useLogout();
    const {toggleSidebar} = useSidebar();
    const options = [
        {
            name:'Settings',
            icon:Settings
        },
        {
            name:'Help Center',
            icon:HelpCircle
        },
        {
            name:'My Subscription',
            icon:Wallet,
            path: '/pricing'
        },
        {
            name:'Sign Out',
            icon:LogOut,
            path: '/'
        },
        
    ]

    const onOptionClick = async (option) => {
        if (option.name === 'Sign Out') {
            logOut();
            toast.success('You have been logged out');
        }

        // Navigate to the specified path
        router.push(option.path || '/');
        toggleSidebar();
    };
  return (
    <div className='p-2 mb-10'>
        {options.map((option,ind)=>(
            <Button variant='ghost' 
            onClick = {()=> onOptionClick(option)}
            className= 'w-full flex justify-start my-3 ' key={ind}>
                   <option.icon />
                    {option.name}
            </Button>
        ))}
    </div>
  )
}

export default SideBarFooter