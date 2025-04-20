import { Dispatch, SetStateAction } from "react";
import { categoryTable, videoCategoriesMappingTable, videoTable } from "../../database";
import { Category, VideoData, VideoSearchFields } from "../../../api/types.gen";
import { VideoManagementService } from "../../../api/services.gen";

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
    
    const cycleDurationField = (direction: number) => {
        const dropdownBox = document.getElementById("durations") as HTMLSelectElement;
        let index = (dropdownBox.selectedIndex + direction + dropdownBox.options.length) % dropdownBox.options.length;
        dropdownBox.selectedIndex = index;
        
        const tempSearchFields = {...searchFields};
        tempSearchFields.duration = dropdownBox.value;
        setSearchFields(tempSearchFields);
    }

    const updateTitleState = (newText: React.ChangeEvent<HTMLInputElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.title = newText.target.value;
        setSearchFields(tempSearchFields);
    }

    const updateDurationState = (selectedOption: React.ChangeEvent<HTMLSelectElement>) => {
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
        setSelectedVideo({id: 0, title: "", description: "", duration: "", categories: [{id: 0, text: ""}]});
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

        VideoManagementService.getVideos(requestData)
            .then( response => {
                setVideoList(response);
            })
            .catch( error => console.log(error) )
    }

    // DELETE VIDEO API
    const deleteVideoButton = (videoID: number) => {
        if (confirm("This will permanently delete this video. Are you sure?")) {
            VideoManagementService.deleteVideo(videoID)
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
        <>
            <div style={{display: "flex", flexDirection: "row"}}>
                <h4>Search Videos</h4>
                <button onClick={() => addVideoButton()}>Add New Video</button>
            </div>
            <hr/>
            <div style={{display: "flex", flexDirection: "column", width: "250px"}}>
                
                <input  type="text" placeholder="Title" onChange={updateTitleState} style={{flex: "1"}}></input>
                <div style={{flex: "1"}}>
                    <label>Duration:</label>
                    <button onClick={() => {cycleDurationField(-1)}}>&lt;</button>
                    <select id="durations" onChange={updateDurationState}>
                        <option value=""></option>
                        <option value="<15min">&lt; 15 minutes</option>
                        <option value="15-30min">15-30 minutes</option>
                        <option value="30-45min">30-45 minutes</option>
                        <option value="45-60min">45-60 minutes</option>
                        <option value=">60min">60+ minutes</option>
                    </select>
                    <button onClick={() => {cycleDurationField(1)}}>&gt;</button>
                </div>
                {/* I want to implement this category text field so that it shows a preview of the available options as you start typeing */}
                <input list="categoryList" style={{flex: "1"}} type="text" placeholder="Category" onChange={updateCategoryState}></input>
                <datalist id="categoryList">
                    {categoryList.map(category => {
                        return (
                            <option value={category.text} />
                        )
                    })}
                </datalist>
                <br/>
                <button style={{flex: "1"}} onClick={() => searchButton()}>Search</button>
            </div>

            <hr/>

            {videoList.length > 0 ?
            <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", border: "1px solid black", backgroundColor: "lightgrey"}}>
                <label style={{width: "350px"}}>Title</label>
                <label style={{width: "100px"}}>Duration</label>
                <label style={{width: "250px"}}>Categories</label>
            </div> :
            <></>
            }
            {videoList.map ((video, index) => {
                return(
                    <>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", border: "1px solid black"}}>
                            <label style={{width: "350px"}}>{video.title}</label>
                            <label style={{width: "100px"}}>{video.duration}</label>
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start"}}>
                                {video.categories.map((category, index) => {
                                    return (
                                        <label style={{width: "250px"}}>{category.text}</label>
                                    )
                                })}
                            </div>
                            <button style={{height: "auto"}} onClick={() => modifyVideoButton(video)}>Modify</button>
                            <button style={{height: "auto"}} onClick={() => deleteVideoButton(video.id)}>Delete</button>
                        </div>
                    </>
                )
            })}
        </>
    );
};

export default ComponentVideoSearch