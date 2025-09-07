import React, { useEffect, useState } from "react";
import ComponentVideoSearch from "./ComponentVideoSearch"
import ComponentWorkshop from "./ComponentWorkshop";
import { Category, VideoData, VideoSearchFields } from "../../../api/types.gen";
import { LogicbuilderService } from "../../../api/services.gen";


const VideoLibrary: React.FC = () => {
  const [ searchFields, setSearchfields ] = useState<VideoSearchFields>({title: "", duration: "", category: ""});
  const [ videoList, setVideoList ] = useState<VideoData[]>([]);
  const [ selectedVideo, setSelectedVideo ] = useState({id: 0, title: "", description: "", duration: "", categories: [{ id: 0, text: "" }]});
  const [ videoWorkshop, setVideoWorkshop ] = useState<string>("");
  const [ categoryList, setCategoryList ] = useState<Category[]>([]);

  useEffect (() => {
    LogicbuilderService.logicbuilderGetcategoriesRetrieve()
      .then( response => setCategoryList(response) )
      .catch( error => console.log(error) )
  }, [])

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
    </>
  );
};

export default VideoLibrary;
