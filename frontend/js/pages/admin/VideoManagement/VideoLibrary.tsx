import React, { useState } from "react";
import ComponentVideoSearch from "./ComponentVideoSearch"
import ComponentWorkshop from "./ComponentWorkshop";

export type SearchFields = {
  title: string;
  duration: string;
  category: string;
}
export type VideoData = {
  id: number;
  title: string;
  description: string;
  duration: string;
  categories: {
    id: number; 
    category: string;
  }[];
}


const VideoLibrary: React.FC = () => {

  const [searchFields, setSearchfields] = useState<SearchFields>({title: "", duration: "", category: ""});
  const [videoList, setVideoList] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState({id: 0, title: "", description: "", duration: "", categories: [{ id: 0, category: "" }]});
  const [videoWorkshop, setVideoWorkshop] = useState<string>("");

  return (
    <>
      <h3>Video Library Management</h3>
      <hr/>
      {videoWorkshop === "" ?
          <ComponentVideoSearch 
            searchFields={searchFields} setSearchFields={setSearchfields}
            videoList={videoList} setVideoList={setVideoList}
            selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}
            videoWorkshop={videoWorkshop} setVideoWorkshop={setVideoWorkshop}
          /> :
          <ComponentWorkshop 
            searchFields={searchFields} setSearchFields={setSearchfields}
            videoList={videoList} setVideoList={setVideoList}
            selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}
            videoWorkshop={videoWorkshop} setVideoWorkshop={setVideoWorkshop}
          />
      }

      <hr/>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
    </>
  );
};

export default VideoLibrary;
