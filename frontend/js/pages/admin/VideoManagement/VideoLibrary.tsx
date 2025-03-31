import React, { useState } from "react";
import ComponentVideoSearch from "./ComponentVideoSearch"
import ComponentWorkshop from "./ComponentWorkshop";


export const videoDatabase: VideoData[] = [
  { id: '000001', title: 'How to Improve Your Public Speaking Skills', duration: '45-60min', categories: ['Sports', 'Science'] },
  { id: '000002', title: 'The History of the Internet', duration: '30-45min', categories: ['Entertainment', 'Education', 'Technology'] },
  { id: '000003', title: 'How to Improve Your Public Speaking Skills', duration: '30-45min', categories: ['Entertainment', 'Business'] },
  { id: '000004', title: 'Simple Home Repairs You Can Do Yourself', duration: '30-45min', categories: ['Science'] },
  { id: '000005', title: 'The History of the Internet', duration: '45-60min', categories: ['Music'] },
  { id: '000006', title: 'Understanding Cryptocurrency', duration: '30-45min', categories: ['Entertainment', 'Art'] },
  { id: '000007', title: 'Yoga for Beginners', duration: '15-30min', categories: ['Art', 'Lifestyle', 'Business'] },
  { id: '000008', title: 'How to Build a Website in 10 Minutes', duration: '45-60min', categories: ['Music'] },
  { id: '000009', title: 'Top 10 Movies to Watch in 2025', duration: '<15min', categories: ['Lifestyle'] },
  { id: '000010', title: 'Learn to Play Guitar in 30 Days', duration: '>60min', categories: ['Sports', 'Art', 'Business', 'Education'] },
  { id: '000011', title: 'How to Travel on a Budget', duration: '>60min', categories: ['Education'] },
  { id: '000012', title: 'The Importance of Mental Health', duration: '<15min', categories: ['Sports', 'Technology', 'Lifestyle', 'Entertainment'] },
  { id: '000013', title: 'The Art of Photography', duration: '<15min', categories: ['Music', 'Art'] },
  { id: '000014', title: 'Introduction to Machine Learning', duration: '<15min', categories: ['Business', 'Health', 'Entertainment', 'Music'] },
  { id: '000015', title: 'Mastering the Art of Cooking', duration: '30-45min', categories: ['Music', 'Lifestyle'] },
  { id: '000016', title: 'Fitness for Busy People', duration: '15-30min', categories: ['Lifestyle', 'Entertainment', 'Health', 'Technology'] },
  { id: '000017', title: 'How to Build a Website in 10 Minutes', duration: '15-30min', categories: ['Entertainment', 'Art'] },
  { id: '000018', title: 'Mastering the Art of Cooking', duration: '15-30min', categories: ['Entertainment'] },
  { id: '000019', title: 'Learn to Play Guitar in 30 Days', duration: '>60min', categories: ['Health', 'Sports'] },
  { id: '000020', title: 'The Art of Photography', duration: '>60min', categories: ['Business', 'Science', 'Technology'] },
  { id: '000021', title: 'How to Start a Business from Scratch', duration: '>60min', categories: ['Lifestyle', 'Education', 'Technology'] },
  { id: '000022', title: "Exploring the Universe: A Beginner's Guide", duration: '30-45min', categories: ['Education'] },
  { id: '000023', title: 'Introduction to Machine Learning', duration: '15-30min', categories: ['Art', 'Lifestyle', 'Business'] },
  { id: '000024', title: 'How to Build a Mobile App from Scratch', duration: '<15min', categories: ['Technology', 'Business', 'Entertainment', 'Education'] },
  { id: '000025', title: "Exploring the Universe: A Beginner's Guide", duration: '30-45min', categories: ['Art', 'Music'] },
  { id: '000026', title: 'Fitness for Busy People', duration: '45-60min', categories: ['Science', 'Entertainment', 'Lifestyle'] },
  { id: '000027', title: 'Eco-Friendly Living Tips', duration: '>60min', categories: ['Science', 'Technology'] },
  { id: '000028', title: 'The Best Workouts for Strength Training', duration: '15-30min', categories: ['Lifestyle', 'Music', 'Health', 'Entertainment'] },
  { id: '000029', title: 'How to Stay Fit While Working from Home', duration: '<15min', categories: ['Science'] },
  { id: '000030', title: 'Healthy Meal Prep Ideas', duration: '30-45min', categories: ['Entertainment', 'Art', 'Technology'] }
]

export type SearchFields = {
  title: string;
  duration: string;
  category: string;
}
export type VideoData = {
  id: string;
  title: string;
  duration: string;
  categories: string[];
}

const VideoLibrary: React.FC = () => {

  const [searchFields, setSearchfields] = useState<SearchFields>({title: "", duration: "", category: ""});
  const [videoList, setVideoList] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData>({id: "", title: "", duration: "", categories: [""]});
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
