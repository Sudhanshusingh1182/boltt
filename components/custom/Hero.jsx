'use client'

import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import Colors from "@/data/Colors";
import Lookup from "@/data/Lookup";
import { ArrowRight, Link } from "lucide-react";
import React, { useContext } from "react";
import { useState } from "react";
import SignInDialog from "./SignInDialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function Hero() {
  const [userInput, setUserInput] = useState();
  
  const {messages, setMessages} = useContext(MessagesContext);
  
  const {userDetail, setUserDetail} = useContext(UserDetailContext);
  
  const [openDialog, setOpenDialog] = useState(false);
  
  const createWorkspace = useMutation(api.workspace.createWorkspace);
  const router = useRouter();

  const onGenerate = async(input) => {
      if(!userDetail?.name){
        setOpenDialog(true); 
        console.log("User detail before login is: ",userDetail);
        
        return;
      }
      
      if(userDetail?.token <10){
        toast.error('You have insufficient tokens to generate response'); 
        return;
      }

      const msg = {
        role:'user', 
        content:input
      }
      //Till this point , we are sure that the user has surely logged in and hence userDetail won't be null.
      console.log("User after login is: ",userDetail);
      
      
        setMessages(msg);

        const userId = userDetail?._id;  // Or userDetail?.uid, depending on your schema

        if (!userId) {
            toast.error('User ID is missing');
            return;
        }
        
        const workspaceId = await createWorkspace({
           user: userDetail?._id,
           messages: [msg]
        })

        console.log(workspaceId);
        router.push(`/workspace/${workspaceId}`)
        
  }

  return (
    <div className="flex flex-col items-center  mt-36 xl:mt-42 gap-2 mx-auto  ">
      <h2 className="font-bold text-4xl">{Lookup.HERO_HEADING} </h2>
      <p className="text-gray-400 font-medium ">{Lookup.HERO_DESC}</p>

      <div className="p-5 border rounded-xl max-w-xl w-full mt-3 "
        style={{backgroundColor : Colors.BACKGROUND}}
      >
        <div className="flex justify-between gap-2  ">
          <textarea
            placeholder={Lookup.INPUT_PLACEHOLDER}
            onChange={(event) => setUserInput(event.target.value)}
            className="outline-none bg-transparent w-full h-32 max-w-56 resize-none"
          />
          { 
           userInput && 
           <ArrowRight 
            onClick={()=> onGenerate(userInput)}
            className="bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer" />
          }
        </div>

        <div>
          <Link className="w-5 h-5 " />
        </div>
      </div>

      <div className="flex mt-8 flex-wrap max-w-2xl items-center justify-center gap-3 " >
        {Lookup?.SUGGSTIONS.map((suggestion,index)=> (
            <h2 key={index}
              onClick={()=>onGenerate(suggestion)} 
              className="p-1 px-2 border rounded-full text-sm text-gray-400 hover:text-white cursor-pointer "
            > {suggestion} </h2>
        ))}
      </div>

      <SignInDialog openDialog={openDialog} closeDialog={(v)=> setOpenDialog(v)} />
    </div>
  );
}

export default Hero;
