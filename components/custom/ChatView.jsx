"use client";

import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { api } from "@/convex/_generated/api";
import Colors from "@/data/Colors";
import Lookup from "@/data/Lookup";
import Prompt from "@/data/Prompt";
import axios from "axios";
import { useConvex, useMutation } from "convex/react";
import { ArrowRight, Link, Loader } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown" ;
import { useSidebar } from "../ui/sidebar";
import { toast } from "sonner";

export const countToken = (inputText) => {
  return inputText.trim().split(/\s+/).filter(word=> word).length;
};

function ChatView() {
  const { id } = useParams();

  const convex = useConvex();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const { messages, setMessages } = useContext(MessagesContext);
  
  const [userInput, setUserInput] = useState();
  const [loading, setLoading] = useState(false);
  const updateMessages = useMutation(api.workspace.updateMessages);
  const {toggleSidebar} = useSidebar();
  const updateTokens = useMutation(api.users.updateToken);

  useEffect(() => {
    id && getWorkspaceData();
  }, [id]);

  /*
       Used to get workspace data using workspace id  
    */
  const getWorkspaceData = async () => {

    const result = await convex.query(api.workspace.getWorkspace, {
      workspaceId: id,
    });
    setMessages(result?.messages);
    //console.log(result);
  };

  useEffect(()=> {
      if(messages?.length >0){
        const role = messages[messages?.length-1].role;
        if(role== 'user'){
         
          getAIResponse();

        } 
      }
  },[messages])
  
  const getAIResponse = async() => {
    setLoading(true);
    const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT ;
    const result = await axios.post('/api/ai-chat',{
         prompt : PROMPT
    });
    
    const aiResp = {
      role:'ai',
      content: result.data.result
   }

    //console.log(result.data.result);
    setMessages(prev => [...prev,aiResp]);

    

    await updateMessages({
         messages: [...messages, aiResp],
         workspaceId: id

      })
    
    const token =Number(userDetail?.token) -Number(countToken(JSON.stringify(aiResp)));
    //update Tokens to Database 
   // console.log("Generated output in string form", JSON.stringify(aiResp));
   // console.log("Token count consumed for that output is : ", countToken(JSON.stringify(aiResp)));
    
   // console.log("Number of tokens left is :", token);
    
    setUserDetail(prev => ({
      ...prev,
      token: token
    }))
     
    await updateTokens({
      userId: userDetail?._id,
      token: token
    })
    setLoading(false);
    
  }

  const onGenerate = (input)=>{
    
    if(userDetail?.token <10){
      toast.error('You have insufficient tokens to generate response'); 
      return;
    }
    
    setMessages(prev=>[...prev,{
       role:'user',
       content: input
    }])

    setUserInput('');
  }

  return (
    <div className="relative h-[85vh] flex flex-col " >
      <div className="flex-1 overflow-y-scroll scrollbar-hide pl-5 ">  
      { Array.isArray(messages) && messages.length >0 ?  (messages?.map((msg, index) => (
        <div 
          key={index}
          className="p-3 rounded-lg mb-2 flex gap-2 items-start leading-7 "
          style={{
            backgroundColor: Colors.CHAT_BACKGROUND,
          }}
        >
          {msg?.role === "user" && (
            <Image
              src={userDetail?.picture}
              alt="userImage"
              width={35}
              height={35}
              className="rounded-full"
            />
          )}
          <h2 className="flex flex-col" >{msg.content} </h2>
           
        </div>
      )))
        : (
          <p className="text-gray-500" >No messages yet</p>
        )
      }
      {loading &&  
            <div 
            className="p-3 rounded-lg mb-2 flex gap-2 items-start" 
            style={{
              backgroundColor: Colors.CHAT_BACKGROUND,}}
            >
             <Loader className="animate-spin" />
             <h2>Generating response..</h2>
          </div>
      }

      </div>
       
       {/* Input Section */}
       <div className="flex gap-2 items-end">
        { userDetail && <Image
        className="rounded-full cursor-pointer"
        onClick={toggleSidebar}
        src={userDetail?.picture} alt="user" width={30} height={30} 
         />}
       <div className="p-5 border rounded-xl max-w-xl w-full mt-3 "
        style={{backgroundColor : Colors.BACKGROUND}}
      >
        <div className="flex justify-between gap-2  ">
          <textarea
            value={userInput}
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

    </div>
    </div>
  );
}

export default ChatView;
