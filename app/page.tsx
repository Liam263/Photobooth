"use client";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { TiCamera } from "react-icons/ti";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
  const maxCanvases = 4;
  const [background, setBackground] = useState('bg-black')
  const currentDate = new Date();
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year

    return `${day}.${month}.${year}`;
  };

  const handleChange = (value: string) => {
    setBackground(value ); 
  };

  const streamVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play(); // Ensure the video plays
      }
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing webcam: ", error);
    }
  };

  const handleClick = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const context = canvas.getContext("2d");

    if (context && videoRef.current) {
      // Draw the current video frame on the new canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }

    // Update the list of canvases
    setCanvases((prevCanvases) => {
      const updatedCanvases = [...prevCanvases, canvas];
      if (updatedCanvases.length > maxCanvases) {
        updatedCanvases.shift(); // Remove the oldest canvas if limit is exceeded
      }
      return updatedCanvases;
    });
  };

  const handleDownload = async () => {
    if (canvasContainerRef.current) {
      const canvas = await html2canvas(canvasContainerRef.current);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/jpeg");
      link.download = "webcam.jpg";
      link.click();
    }
  };

  const handleClearImages = () => {
    setCanvases([]);
  };
  useEffect(() => {
    streamVideo();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="container flex flex-row  justify-center space-x-10 h-full">
      <div className="flex flex-col items-center justify-center space-y-5">
        <p className="font-bold text-6xl">Photobooth</p>
        <video
          ref={videoRef}
          className="bg-gray-400"
          width="640"
          height="480"
          autoPlay
          muted
        ></video>
        <div className="mt-4 flex flex-col items-center justify-center gap-4">
          <div className="bg-red-500 p-3 rounded-full">
            <TiCamera
              onClick={handleClick}
              className="cursor-pointer text-4xl text-slate-50"
            />
          </div>
          {canvases.length > 0 && (
            <div className="flex flex-row gap-2">
              <Button onClick={handleDownload} className="gap-2">
                Download
                <Download className="w-4 h-4" />
              </Button>
              <Button className="" onClick={handleClearImages}>
                Clear Images
              </Button>
              <Select onValueChange={handleChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-black">Black</SelectItem>
                  <SelectItem value="bg-blue-500">Light Blue</SelectItem>
                  <SelectItem value="bg-gray-300">White</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Display the list of canvases */}
      <div
        ref={canvasContainerRef}
        className={`${
          canvases.length > 0 ? `flex flex-col gap-2 mt-4 p-2 ${background}` : ""
        }`}
      >
        {canvases.map((canvas, index) => (
          <div key={index} className="relative ">
            <canvas
              width="200"
              height="150"
              className="w-full h-full"
              ref={(ref) => {
                if (ref) {
                  const ctx = ref.getContext("2d");
                  if (ctx) {
                    ctx.drawImage(canvas, 0, 0, ref.width, ref.height);
                  }
                }
              }}
            />
          </div>
        ))}
        {canvases.length === 4 && (
          <div className="flex flex-col items-end justify-center">
            <input
              className={ background === 'bg-black'? 'text-white bg-transparent border-none font-bold placeholder:text-slate-500 text-left text-lg': `bg-transparent border-none font-bold placeholder:text-slate-500 text-left text-lg`}
              placeholder="Happy Birthday"
            />
            <div className={background === 'bg-black'? 'font-semibold text-sm text-white': `font-semibold text-sm`}>to ____________________</div>
            <div className={background === 'bg-black'? 'text-sm text-white':"text-sm text-slate-500"}>
              {formatDate(currentDate)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
