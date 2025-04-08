import { Dispatch, SetStateAction } from "react";
import { SearchFields, VideoData, videoDatabase } from "./VideoLibrary";

interface VideoManagementStates {
    searchFields:               SearchFields;       setSearchFields:            Dispatch<SetStateAction<SearchFields>>;
    videoList:                  VideoData[];        setVideoList:               Dispatch<SetStateAction<VideoData[]>>; 
    selectedVideo:              VideoData;          setSelectedVideo:           Dispatch<SetStateAction<VideoData>>; 
    videoWorkshop:              string;             setVideoWorkshop:           Dispatch<SetStateAction<string>>;
}

const ComponentWorkshop: React.FC<VideoManagementStates> = ({
    searchFields, setSearchFields,
    videoList, setVideoList,
    selectedVideo, setSelectedVideo,
    videoWorkshop, setVideoWorkshop}) => {


        const cycleDurationField = (direction: number) => {
            const dropdownBox = document.getElementById("durations") as HTMLSelectElement;
            let index = (dropdownBox.selectedIndex + direction + dropdownBox.options.length) % dropdownBox.options.length;
            dropdownBox.selectedIndex = index;
            
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.duration = dropdownBox.value;
            setSelectedVideo(tempSearchFields);
        }

        const updateTitleState = (newText: React.ChangeEvent<HTMLInputElement>) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.title = newText.target.value;
            setSelectedVideo(tempSearchFields);
        }
    
        const updateDurationState = (selectedOption: React.ChangeEvent<HTMLSelectElement>) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.duration = selectedOption.target.value;
            setSelectedVideo(tempSearchFields);
        }
    
        const updateCategoryState = (selectedOption: React.ChangeEvent<HTMLInputElement>, index: number) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.categories[index] = selectedOption.target.value;
            setSelectedVideo(tempSearchFields);
        }

        const addCategoryField = () => {
            setSelectedVideo({ ...selectedVideo, categories: [ ...selectedVideo.categories, "" ]});
        }

        const deleteCategoryField = (index: number) => {
            if (selectedVideo.categories.length < 2) return;

            const tempSearchFields = [ ...selectedVideo.categories ];
            tempSearchFields.splice(index, 1);
            setSelectedVideo({ ...selectedVideo, categories: tempSearchFields });
        }

        const cancelButton = () => {
            
            setVideoWorkshop("");
            setSelectedVideo({id: 0, title: "", duration: "", categories: [""]});
        }

        const addVideoButton = () => {
            const file = document.getElementById("fileInput");

            // do input validation
            if (file?.isDefaultNamespace.length === 0) {alert("You must choose a file to upload!"); return;}
            if (selectedVideo.duration === "") {alert("You must enter a duration!"); return; }
            if (selectedVideo.title === "") {alert("You must enter a title!");return;}
            for (let i = 0; i < selectedVideo.categories.length; i++) {if (selectedVideo.categories[i] === "") {alert("You must remove empty category fields!"); return;}}

            // ADD API STUFF HERE. 
            // WE NEED TO FIGURE OUT HOW TO XFER THE FILE OVER THE API CALL 
            // THEN ADD THE FILE PATH TO THE DATABASE RECORD.
            
            // START TEST CODE
            // This calculates the new index
            let index = videoDatabase[videoDatabase.length-1].id + 1;


            const tempSelectedVideo = selectedVideo;
            tempSelectedVideo.id = index;
            videoDatabase.push(tempSelectedVideo);
            // END TEST CODE

            setVideoWorkshop("");
            setSelectedVideo({id: 0, title: "", duration: "", categories: [""]});
        }

        const modifyVideoButton = () => {
            // do input validation

            const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
            // Not working...
            if (fileInput === null || fileInput.files === null || fileInput.files.length < 1) {
                alert("You must choose a file to upload!");
                return;
            }
            if (selectedVideo.duration === "") {
                alert("You must enter a duration!");
                return;
            }
            if (selectedVideo.title === "") {
                alert("You must enter a title!");
                return;
            }
            for (let i = 0; i < selectedVideo.categories.length; i++) {
                if (selectedVideo.categories[i] === "") {
                    alert("You must remove empty category fields!");
                    return;
                }
            }
            
            // ADD API STUFF HERE.

            // START TEST CODE
            for (let i = 0; i < videoDatabase.length; i++) {

                if (videoDatabase[i].id === selectedVideo.id) {
                    videoDatabase[i] = selectedVideo;
                    break;
                }
            }
            // END TEST CODE

            setVideoWorkshop("");
            setSelectedVideo({id: 0, title: "", duration: "", categories: [""]});
        }

        return(
            <>            
                <div style={{display: "flex", flexDirection: "row"}}>
                    {videoWorkshop === "new" ?
                        <h4>Add New Video</h4> :
                        <h4>Modify Video</h4>
                    }
                    <button onClick={() => cancelButton()}>Cancel</button>
                </div>
                <hr/>
                <div style={{display: "flex", flexDirection: "column", width: "250px"}}>
                    
                    <input type="text" value={selectedVideo.title} placeholder="Title" onChange={updateTitleState} style={{flex: "1"}}></input>
                    <div style={{flex: "1"}}>
                        <label>Duration:</label>
                        <button onClick={() => {cycleDurationField(-1)}}>&lt;</button>
                        <select value={selectedVideo.duration} id="durations" onChange={updateDurationState}>
                            <option value=""></option>
                            <option value="<15min">&lt; 15 minutes</option>
                            <option value="15-30min">15-30 minutes</option>
                            <option value="30-45min">30-45 minutes</option>
                            <option value="45-60min">45-60 minutes</option>
                            <option value=">60min">60+ minutes</option>
                        </select>
                        <button onClick={() => {cycleDurationField(1)}}>&gt;</button>
                    </div>

                    
                    { /* I want to implement this category text field so that it shows a preview of the available options as you start typeing */
                    selectedVideo.categories.map((category, index) => (
                        <div key={index} style={{flex: "1"}}>
                            <input onChange={(value) => updateCategoryState(value, index)} value={selectedVideo.categories[index]} name="category" type="text" placeholder="Category"/>
                            <button onClick={ async () => deleteCategoryField(index) }>X</button>
                        </div>
                    ))
                    }
                    <button onClick={() => setSelectedVideo({ ...selectedVideo, categories: [ ...selectedVideo.categories, "" ]})} style={{flex: "1"}}>Add Category</button>

                    
                    {videoWorkshop === "new" ?
                        <>
                            <input name="fileInput" id="fileInput" type="file"></input>
                            <br/>
                            <button onClick={ () => addVideoButton() } style={{flex: "1"}} >Add Video</button>
                        </> :
                        <>
                            <br/>
                            <button onClick={ () => modifyVideoButton() } style={{flex: "1"}} >Confirm Changes</button>
                        </>
                        
                    }
                </div>


            </>
        )
}

export default ComponentWorkshop;