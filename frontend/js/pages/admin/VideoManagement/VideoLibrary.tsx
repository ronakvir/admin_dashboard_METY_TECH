import React, { useEffect, useState } from "react";
import ComponentVideoSearch from "./ComponentVideoSearch"
import ComponentWorkshop from "./ComponentWorkshop";
import { VideoSearch } from "../../../api/types.gen";
import { LogicbuilderService } from "../../../api/services.gen";

// Define local types based on the API structure
type Category = {
    id: number;
    text: string;
};

type VideoData = {
    id: number;
    title: string;
    description: string;
    duration: string;
    url?: string | null;
    categories: Category[];
};

type VideoSearchFields = VideoSearch;


const VideoLibrary: React.FC = () => {
  const [ searchFields, setSearchfields ] = useState<VideoSearchFields>({title: "", duration: "", category: ""});
  const [ videoList, setVideoList ] = useState<VideoData[]>([]);
  const [ selectedVideo, setSelectedVideo ] = useState({id: 0, title: "", description: "", duration: "", url: "", categories: [{ id: 0, text: "" }]});
  const [ videoWorkshop, setVideoWorkshop ] = useState<string>("");
  const [ categoryList, setCategoryList ] = useState<Category[]>([]);

  useEffect (() => {
    LogicbuilderService.logicbuilderGetcategoriesRetrieve()
      .then( response => setCategoryList(response) )
      .catch( error => console.log(error) )
  }, [])

  return (
    <div className="video-management">
      <h2>Video Library Management</h2>
      <hr/>
      {videoWorkshop === "" ?
          <ComponentVideoSearch 
            searchFields={searchFields} setSearchFields={setSearchfields}
            videoList={videoList} setVideoList={setVideoList}
            selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}
            videoWorkshop={videoWorkshop} setVideoWorkshop={setVideoWorkshop}
            categoryList={categoryList} setCategoryList={setCategoryList}
          /> :
          <ComponentWorkshop 
            searchFields={searchFields} setSearchFields={setSearchfields}
            videoList={videoList} setVideoList={setVideoList}
            selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}
            videoWorkshop={videoWorkshop} setVideoWorkshop={setVideoWorkshop}
            categoryList={categoryList} setCategoryList={setCategoryList}
          />
      }

      <hr/>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
    </div>
  );
};

export default VideoLibrary;
