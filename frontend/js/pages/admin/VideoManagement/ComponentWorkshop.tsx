import { Dispatch, SetStateAction } from "react";
import { Category, VideoData, VideoSearchFields } from "../../../api/types.gen";
import { categoryTable, videoCategoriesMappingTable, videoTable } from "../../database";
import { VideomanagementService } from "../../../api/services.gen";

interface VideoManagementStates {
    searchFields:               VideoSearchFields;       setSearchFields:            Dispatch<SetStateAction<VideoSearchFields>>;
    videoList:                  VideoData[];        setVideoList:               Dispatch<SetStateAction<VideoData[]>>; 
    selectedVideo:              VideoData;          setSelectedVideo:           Dispatch<SetStateAction<VideoData>>; 
    videoWorkshop:              string;             setVideoWorkshop:           Dispatch<SetStateAction<string>>;
    categoryList:               Category[];         setCategoryList:            Dispatch<SetStateAction<Category[]>>;
}
export let indexCounter = 100;
const ComponentWorkshop: React.FC<VideoManagementStates> = ({
    searchFields, setSearchFields,
    videoList, setVideoList,
    selectedVideo, setSelectedVideo,
    videoWorkshop, setVideoWorkshop,
    categoryList, setCategoryList,}) => {


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

            tempSearchFields.categories[index].id = 0
            tempSearchFields.categories[index].text = selectedOption.target.value;
            setSelectedVideo(tempSearchFields);
        }

        const updateDescriptionState = (selectedOption: React.ChangeEvent<HTMLTextAreaElement>) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.description = selectedOption.target.value;
            setSelectedVideo(tempSearchFields);
        }

        const removeCategoryField = (index: number) => {
            if (selectedVideo.categories.length < 2) return;

            const tempSearchFields = [ ...selectedVideo.categories ];
            tempSearchFields.splice(index, 1);
            setSelectedVideo({ ...selectedVideo, categories: tempSearchFields });
        }

        const cancelButton = () => {
            setVideoWorkshop("");
            setSelectedVideo({id: 0, title: "", description: "", duration: "", categories: [{id: 0, text: ""}]});
        }

        // Calls the modify video function - they invoke the same API
        const addVideoButton = () => {
            // do input validation
            const file = document.getElementById("fileInput");
            if (file?.isDefaultNamespace.length === 0) {alert("You must choose a file to upload!"); return;}
            modifyVideoButton();
        }

        const modifyVideoButton = () => {
            if (selectedVideo.duration === "") {alert("You must enter a duration!"); return; }
            if (selectedVideo.title === "") {alert("You must enter a title!");return;}
            for (let i = 0; i < selectedVideo.categories.length; i++) {if (selectedVideo.categories[i].text === "") {alert("You must remove empty category fields!"); return;}}

            const areAllUnique = new Set(selectedVideo.categories.map(c => c.text.trim().toLowerCase())).size === selectedVideo.categories.length;
            if (!areAllUnique) {alert("Category fields must be unique"); return;}

            console.log(selectedVideo);
            VideomanagementService.videomanagementCreatevideoCreate({ requestBody: selectedVideo })
                .then( response => {
                    console.log(response.id);
                    setVideoWorkshop("");
                    setSelectedVideo({id: 0, title: "", description: "", duration: "", categories: [{id: 0, text: ""}]});
                })
                .catch( error => console.log(error) )
        }

        return(
            <div style={{display: "flex", flexDirection: "row"}}>       
                <div style={{display: "flex", flexDirection: "column", margin: "10px"}}>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        {videoWorkshop === "new" ?
                            <h4>Add New Video</h4> :
                            <h4>Modify Video</h4>
                        }
                        <button onClick={() => cancelButton()}>Cancel</button>
                    </div>
                    <hr/>
                    <div style={{display: "flex", flexDirection: "column", width: "350px", margin: "10px"}}>
                        
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
                                <input list="categoryList" onChange={(value) => updateCategoryState(value, index)} value={selectedVideo.categories[index].text} name="category" type="text" placeholder="Category"/>
                                <button onClick={ async () => removeCategoryField(index) }>X</button>
                            </div>
                        ))
                        }
                        <button onClick={() => setSelectedVideo({ ...selectedVideo, categories: [ ...selectedVideo.categories, {id: 0, text: "" }]})} style={{flex: "1"}}>Add Category</button>
                        <datalist id="categoryList">
                            {categoryList.map(category => {
                                if(selectedVideo.categories.some( categoryCheck => category.text === categoryCheck.text)) return null;
                                return (
                                    <option value={category.text} />
                                )
                            })}
                        </datalist>

                        
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
                </div>
                <div style={{display: "flex", flexDirection: "column", margin: "10px" }}>
                    <h5>Description</h5>
                    <textarea style={{width: "350px", height: "150px"}}onChange = {(e) => updateDescriptionState(e)} value={selectedVideo.description} />
                </div>
                

            </div>
        )
}

export default ComponentWorkshop;