import { Dispatch, SetStateAction } from "react";
import { categoryTable, videoCategoriesMappingTable, videoTable } from "../../database";
import { GetVideoWithCategories, VideoSearch } from "../../../api/types.gen";
import { VideomanagementService } from "../../../api/services.gen";

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

interface VideoManagementStates {
    searchFields:               VideoSearchFields;       setSearchFields:            Dispatch<SetStateAction<VideoSearchFields>>;
    videoList:                  VideoData[];        setVideoList:               Dispatch<SetStateAction<VideoData[]>>; 
    selectedVideo:              VideoData;          setSelectedVideo:           Dispatch<SetStateAction<VideoData>>; 
    videoWorkshop:              string;             setVideoWorkshop:           Dispatch<SetStateAction<string>>;
    categoryList:               Category[];         setCategoryList:            Dispatch<SetStateAction<Category[]>>;
}

const ComponentVideoSearch: React.FC<VideoManagementStates> = ({
    searchFields, setSearchFields,
    videoList, setVideoList,
    selectedVideo, setSelectedVideo,
    videoWorkshop, setVideoWorkshop,
    categoryList, setCategoryList,}) => {
    

    const updateTitleState = (newText: React.ChangeEvent<HTMLInputElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.title = newText.target.value;
        setSearchFields(tempSearchFields);
    }

    const updateDurationState = (selectedOption: React.ChangeEvent<HTMLInputElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.duration = selectedOption.target.value;
        setSearchFields(tempSearchFields);
    }

    const updateCategoryState = (selectedOption: React.ChangeEvent<HTMLInputElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.category = selectedOption.target.value;
        setSearchFields(tempSearchFields);
    }

    const modifyVideoButton = (video: VideoData) => {
        setVideoList([]);
        setSelectedVideo(video);
        setVideoWorkshop("modify");
        setSearchFields({title: "", duration: "", category: ""});
        return;
    }

    const addVideoButton = () => {
        setVideoList([]);
        setSelectedVideo({id: 0, title: "", description: "", duration: "", url: "", categories: [{id: 0, text: ""}]});
        setVideoWorkshop("new");
        setSearchFields({title: "", duration: "", category: ""});
    }

    // GET VIDEOS API
    const searchButton = () => {
        setVideoList([]);
        const requestData = {
            title: searchFields.title,
            duration: searchFields.duration,
            category: searchFields.category
        }

        VideomanagementService.videomanagementGetvideosCreate({ requestBody: requestData })
            .then( response => {
                // Convert GetVideoWithCategories[] to VideoData[]
                const videoDataList: VideoData[] = response.map(video => ({
                    id: video.id,
                    title: video.title,
                    duration: video.duration,
                    description: video.description,
                    url: video.url || "",
                    categories: Array.isArray(video.categories) ? video.categories : []
                }));
                setVideoList(videoDataList);
            })
            .catch( error => console.log(error) )
    }

    // DELETE VIDEO API
    const deleteVideoButton = (videoID: number) => {
        if (confirm("This will permanently delete this video. Are you sure?")) {
            VideomanagementService.videomanagementDeletevideoDestroy({ id: videoID })
                .then( response => {
                    const tempVideoList = [ ...videoList ];
                    const index = videoList.findIndex( video => video.id === videoID);
                    tempVideoList.splice(index, 1);
                    setVideoList(tempVideoList);
                    setSearchFields({title: "", duration: "", category: ""});
                })
                .catch( error => console.log(error) )
        }
    }

    return (
  <div className="video-management">
    {/* Header */}
    <div className="header-row" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <h4 style={{ margin: 0 }}>Search Videos</h4>
        <button className="btn-back" onClick={addVideoButton}>Add New Video</button>
    </div>

    {/* Search Panel */}
    <div className="search-panel">
      <input type="text" placeholder="Title" onChange={updateTitleState} />
      <input type="text" placeholder="Duration (e.g., 3:20, 45:30)" onChange={updateDurationState} />
      <input list="categoryList" type="text" placeholder="Category" onChange={updateCategoryState} />
      <datalist id="categoryList">
        {categoryList.map((category) => (
          <option key={category.id} value={category.text} />
        ))}
      </datalist>
      <button className="btn-search" onClick={searchButton}>Search</button>
    </div>

    {/* Video Table Header */}
    {videoList.length > 0 && (
      <div className="video-table-header">
        <span style={{ width: "300px" }}>Title</span>
        <span style={{ width: "100px" }}>Duration</span>
        <span style={{ width: "300px" }}>URL</span>
        <span style={{ width: "200px" }}>Categories</span>
        <span style={{ width: "150px" }}>Actions</span>
      </div>
    )}

    {/* Video List */}
    {videoList.map((video) => (
      <div key={video.id} className="video-row">
        <span style={{ width: "300px" }}>{video.title}</span>
        <span style={{ width: "100px" }}>{video.duration}</span>
        <span style={{ width: "300px", wordBreak: "break-all" }}>{video.url || "No URL"}</span>
        <div style={{ display: "flex", flexDirection: "column", width: "200px" }}>
          {video.categories.map((cat, idx) => (
            <span key={idx}>{cat.text}</span>
          ))}
        </div>
        <div className="action-buttons">
          <button className="btn-edit-small" onClick={() => modifyVideoButton(video)}>Modify</button>
          <button className="btn-delete-small" onClick={() => deleteVideoButton(video.id)}>Delete</button>
        </div>
      </div>
    ))}

    {/* Styles */}
    <style>{`
      .video-management {
        padding: 20px;
        font-family: Arial, sans-serif;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .search-panel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 250px;
        margin-bottom: 20px;
      }
      .search-panel input {
        padding: 6px;
        font-size: 14px;
      }
      .btn-back, .btn-search, .btn-edit-small, .btn-delete-small {
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        padding: 6px 12px;
      }
      .btn-back {
        background-color: #6c757d;
        color: white;
      }
      .btn-search {
        background-color: #007bff;
        color: white;
      }
      .btn-edit-small {
        background-color: #007bff;
        color: white;
        font-size: 12px;
        padding: 4px 8px;
      }
      .btn-delete-small {
        background-color: #dc3545;
        color: white;
        font-size: 12px;
        padding: 4px 8px;
      }
      .btn-back:hover, .btn-search:hover, .btn-edit-small:hover, .btn-delete-small:hover {
        opacity: 0.85;
      }
      .video-table-header, .video-row {
        display: flex;
        flex-direction: row;
        padding: 8px;
        border: 1px solid #ddd;
        align-items: center;
      }
      .video-table-header {
        background-color: #f8f9fa;
        font-weight: bold;
      }
      .video-row:nth-child(odd) {
        background-color: #fafafa;
      }
      .video-row:hover {
        background-color: #f1f1f1;
      }
      .action-buttons {
        display: flex;
        gap: 6px;
        width: 150px;
      }
    `}</style>
  </div>
);

};

export default ComponentVideoSearch