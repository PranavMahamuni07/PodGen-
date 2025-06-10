import { GeneratePodcastProps } from '@/types'
import React, { useState } from 'react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/components/ui/use-toast"
import { useUploadFiles } from '@xixixao/uploadstuff/react';

const useGeneratePodcast = ({
  setAudio, voiceType, voicePrompt, setAudioStorageId
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast()

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl)
  const getPodcastAudio = useAction(api.openai.generateAudioAction)
  const getAudioUrl = useMutation(api.podcasts.getUrl);

  const generatePodcast = async () => {
    setIsGenerating(true);
    setAudio('');

    if(!voiceType) {
      toast({ title: "Please select a voice type to generate a podcast" })
      return setIsGenerating(false);
    }

    if(!voicePrompt) {
      toast({ title: "Please provide a prompt to generate podcast" })
      return setIsGenerating(false);
    }

    try {
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt
      })

      const blob = new Blob([response], { type: 'audio/mpeg' });
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setAudioStorageId(storageId);
      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      toast({ title: "Podcast generated successfully" });
    } catch (error) {
      console.error('Error generating podcast', error)
      toast({ title: "Error creating the podcast", variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleAudioUpload = async (file: File) => {
    setIsUploading(true);
    setAudio('');

    try {
      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setAudioStorageId(storageId);
      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      toast({ title: "Audio uploaded successfully!" });
    } catch (error) {
      console.error('Error uploading audio', error)
      toast({ title: "Error uploading audio", variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  }

  return { isGenerating, generatePodcast, isUploading, handleAudioUpload }
}

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast, isUploading, handleAudioUpload } = useGeneratePodcast(props);

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1">
          AI Prompt to generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-[--accent-color]"
          placeholder='Input text to generate audio'
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-5 mt-5">
        <div className="w-full max-w-[200px]">
          <Button 
            className="text-16 bg-[--accent-color] py-4 font-bold text-white-1 w-full" 
            onClick={generatePodcast}
            disabled={isGenerating || isUploading}
          >
            {isGenerating ? (
              <>
                Generating
                <Loader size={20} className="animate-spin ml-2" />
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </div>
        
        <span className="text-white-1">OR</span>
        
        <div className="w-full max-w-[200px]">
          <label className="flex items-center justify-center text-16 bg-[--accent-color] py-4 font-bold text-white-1 w-full rounded cursor-pointer hover:opacity-90 disabled:opacity-50">
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                if(e.target.files?.[0]) {
                  handleAudioUpload(e.target.files[0])
                }
              }}
              disabled={isUploading || isGenerating}
            />
            {isUploading ? (
              <>
                Uploading
                <Loader size={20} className="animate-spin ml-2" />
              </>
            ) : (
              'Upload Audio'
            )}
          </label>
        </div>
      </div>

      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) => props.setAudioDuration(e.currentTarget.duration)}
        />
      )}
    </div>
  )
}

export default GeneratePodcast