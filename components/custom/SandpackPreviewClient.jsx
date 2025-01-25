import { ActionContext } from '@/context/ActionContext';
import { SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import React, { useContext, useEffect, useRef } from 'react';
import { toast } from 'sonner';

function SandpackPreviewClient() {
    const previewRef = useRef();
    const { sandpack } = useSandpack();
    const { action, setAction } = useContext(ActionContext);

    useEffect(() => {
        getSandpackClient();
    }, [sandpack && action]);

    const getSandpackClient = async () => {
        const client = previewRef.current?.getClient();

        if (client) {
            console.log("Client is: ", client);
            const result = await client?.getCodeSandboxURL();
            console.log(result);

            if (action?.actionType === 'deploy') {
                const deploymentLink = `https://${result?.sandboxId}.csb.app`;

                // Open the deployment link in a new tab
                //window.open(deploymentLink);

                // Copy the deployment link to the clipboard
                try {
                    await navigator.clipboard.writeText(deploymentLink);
                    console.log('Link copied to clipboard:', deploymentLink);
                    toast.success('Link copied to clipboard successfully!');
                   // alert('Link copied to clipboard!');
                } catch (error) {
                    console.error('Failed to copy link:', error);
                    toast.error('Failed to copy the link to clipboard.');
                    // alert('Failed to copy the link to clipboard.');
                }
            } else if (action?.actionType === 'export') {
                window.open(result?.editorUrl);
            }
        }
    };

    return (
        <SandpackPreview 
            ref={previewRef}
            style={{ height: "80vh" }}
            showNavigator={true}
        />
    );
}

export default SandpackPreviewClient;
