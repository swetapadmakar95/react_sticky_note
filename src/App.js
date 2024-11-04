import React from 'react';
import './App.css';
import { PhotoIcon,ArrowLeftIcon, XMarkIcon,PlusIcon,Cog6ToothIcon,EllipsisHorizontalIcon,ListBulletIcon,ArrowUpOnSquareIcon,ArrowDownOnSquareIcon,TrashIcon } from '@heroicons/react/24/solid';
import Draggable from 'react-draggable';
import { Switch,Dialog } from "@headlessui/react";
import {jwtDecode} from 'jwt-decode';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { deepOrange, deepPurple } from '@mui/material/colors';

function App() {
  const [allNote, setAllNote] = React.useState([]);
  const [showeditnote, setShowEditNote] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [showthenote,setShowTheNote] = React.useState(false);
  const [showingnoteitem,setShowingNoteItem] = React.useState([]);
  const [noteTitle, setNoteTitle] = React.useState();
  const [noteContent, setNoteContent] = React.useState();
  const [opennoteid, setopennoteid] = React.useState(null);
  const [searchNote, setSearchNote] = React.useState('');
  const [shownewNote,setShowNewNote] = React.useState(false);
  const [showAuthMenu,setShowAuthMenu] = React.useState(false);
  const [insightsEnabled, setInsightsEnabled] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(true);
  const [theme, setTheme] = React.useState("system");
  const [showModal, setShowModal] = React.useState(false);
  const [dontAskAgain, setDontAskAgain] = React.useState(false);
  const [noteToDelete, setNoteToDelete] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);
  const [showSignoutPopup,setshowSignoutPopup] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(true); // To toggle between Login and Signup
  const [message, setMessage] = React.useState('');
  const [userData, setUserData] = React.useState({ name:'', email: '', name: '' });
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [IsSignIn, setIsSignIn] = React.useState(false);

  React.useEffect(()=>{
    signinfirst()
  },[]);

  React.useEffect(() => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme]);
  

  async function signinfirst() {
    const token = localStorage.getItem('token');
    if (token) {
      setIsSignIn(false)
        try {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 > Date.now()) { // Check token expiration
              const userResponse = await fetch(`https://react-sticky-note.onrender.com/user/${decodedToken?.user?.id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` } // Include the token for authentication
            });
    
            if (!userResponse.ok) {
                const userError = await userResponse.json();
                setMessage(userError.error || 'Failed to fetch user info');
                return;
            }
    
            const userData = await userResponse.json();
            setUserData({ email: userData.email, name: userData.name });
            fetchdata()
            } else {
                // Token expired
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Invalid token:', error);
            localStorage.removeItem('token');
        }
    }
    else{
      setIsSignIn(true)
    }
  }
  async function fetchdata(){
    try{
      const res = await fetch('https://react-sticky-note.onrender.com');
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await res.json();
      console.log(json);
      setAllNote(json)
    }
    catch(err){
      console.log(err.message)
    }
  }
  const openNewNote = () => {
    setShowNewNote(true);
    setShowTheNote(false)
    addNewNote()
  };

  const openDeleteModal = (note) => {
    if(confirmDelete){
      if (!dontAskAgain) {
        setNoteToDelete(note); // Store the note to be deleted
        setShowModal(true);
      } else {
        deleteNoteImmediately(note); // If 'Don't ask me again' is checked, delete without confirmation
      }
    }
    else{
      deleteNoteImmediately(note)
    }
    setActiveDropdown(null);
  };

  const deleteNoteImmediately = async (itm) => {
    try {
      const response = await fetch(`https://react-sticky-note.onrender.com/${itm?._id}`, {
        method: 'DELETE',
      });
      
      // Log the response as text to see what is being returned
      const result = await response.text();  // Fetch the response as text
      console.log('Response text:', result);
  
      if (!response.ok) {
        throw new Error('Failed to delete item.');
      }
  
      console.log('Deleted:', itm?._id);
      fetchdata();
    } catch (err) {
      console.log('Error:', err.message);
    }
  };

  const deleteNote = () => {
    if (noteToDelete) {
      deleteNoteImmediately(noteToDelete)
      console.log(`Deleting note: ${noteToDelete.Title}`);
    }
    setShowModal(false);
  };
  

  // toggle note
  const openNote = (item) => {
    setNoteContent(item?.content)
    if (!showingnoteitem.some(openedNote => openedNote._id === item._id)) {
      setShowingNoteItem([...showingnoteitem, item]);
    }
    else{
      setShowingNoteItem([item])
    }
    setNoteTitle(item?.Title);
    setopennoteid(item?._id);
    setShowTheNote(true)
    setShowNewNote(false);
    setActiveDropdown(null);
  };
  const closeNote = ()=>{
    setopennoteid(null);
    setShowTheNote(false)
  }
  const cancelNote = () => {
    setShowTheNote(false);
  };
  const applyBold = (value,bullet) => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let Element = '';
  
      try {
        // Check if the range contains text nodes.
        if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE || range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE) {
          if (value === 'bold') {
            Element = document.createElement('strong');
          } else if (value === 'italic') {
            Element = document.createElement('em');
          } else if (value === 'underline') {
            Element = document.createElement('u');
          } else if (value === 'strikethrough') {
            Element = document.createElement('s');
          } else if (value === 'listbullet') {
            // Bullet point logic
            const liElement = document.createElement('li');
  
            if (!range.collapsed) {
              liElement.appendChild(range.extractContents());
            } else {
              const blockNode = range.startContainer;
              liElement.textContent = blockNode.nodeValue || ''; 
            }
  
            const ulElement = document.createElement('ul');
            ulElement.appendChild(liElement); // Add <li> to <ul>
  
            // Insert the bullet list at the cursor position
            range.insertNode(ulElement);
            range.setStartAfter(ulElement);

          }
          // Apply inline formatting for bold/italic/underline/strikethrough
          if (value !== 'listbullet') {
            Element.appendChild(range.extractContents());
            range.insertNode(Element);
            range.setStartAfter(Element);
          }
          if(bullet === true){
            const ulElements = document.getElementById('listcontent').querySelectorAll("ul");
            ulElements.forEach(ul => {
              ul.style.listStyleType = "disc";
              ul.style.marginLeft = "20px"; // Adjusting for indentation
            });
          }
          else{
            const ulElements = document.getElementById('listcontent').querySelectorAll("ul");
            ulElements.forEach(ul => {
              ul.style.listStyleType = "none";
              ul.style.marginLeft = "0px"; // Adjusting for indentation
            });
          }
          // Clear the current selection and update it after insertion
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  const handleTitleChange = (e) => {
    setNoteTitle(e.target.innerHTML);
  };

  const handleContentChange = (e) => {
    setNoteContent(e.target.innerHTML);
  };

  const handleBlur = (itm) => {
    saveNote(itm)
  };

  const addNewNote = async()=>{
    try{
      const response = await fetch('https://react-sticky-note.onrender.com',{
        method: 'POST',
        body:JSON.stringify({
          Title: noteTitle,
          Date: new Date(),
          content: noteContent
        }),
        headers: {'Content-type': 'application/json; charset=utf-8'}
      })
      if(!response.ok){
        throw new Error('Failed to post data')
      }
      const data = await response.json();
      console.log(data);
      fetchdata();
      // setShowNewNote(false);
      // setShowTheNote(true)
    }
    catch(error){
      console.error('Error posting data:', error.message);
    }
  }

  const saveNote = async(itm) => {
    try{
      const response = await fetch(`https://react-sticky-note.onrender.com/${itm?._id}`,{
        method:'PATCH',
        body:JSON.stringify({
          Title: noteTitle,
          content: noteContent,
          imageUrl: selectedImage
        }),
        headers:{'Content-type': 'application/json; charset=UTF-8'},
      })
      if(!response.ok){
        throw new Error('Failed to update item.')
      }
      const data = await response.json();
      console.log(data);
      setEditingId(null);
      setShowEditNote(false);
      fetchdata();
    }
    catch(err){
      console.log(err.message)
    }
  };

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null); // Close the dropdown if the same icon is clicked again
    } else {
      setActiveDropdown(id); // Open the dropdown for the clicked note
    }
  };
  const toggleAuthMenu = () => {
    setShowAuthMenu(true);
  };
  const backNotelist = ()=>{
    setShowAuthMenu(false);
  }
  const handleSignup = ()=>{
    setIsAuthenticated(false);
  }
  const handleSignOut = () => {
    setshowSignoutPopup(true)
    // setIsAuthenticated(true);
  };

  const handleSignOutImmediately = () => {
    setshowSignoutPopup(false);
    setIsAuthenticated(false);
    localStorage.removeItem('token'); // Remove token from localStorage
    setUserData({ name: '', email: '' }); // Clear user data from state
  };


  const handleSignIn = async () => {
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const signupuserData = { name, email, password };
    const signinuserData = { email, password };
  
    try {
      const response = await fetch(`https://react-sticky-note.onrender.com${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(isLogin ? signinuserData : signupuserData),
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    
      if (!response.ok) {
        const errorData = await response.json(); 
        setMessage(errorData.error);
        return;
      }
  
      const data = await response.json(); 
      localStorage.setItem('token', data.token); 

      const userInfo = jwtDecode(data.token);

      const userId = userInfo.user.id; // Ensure your token includes the user ID

        // Fetch user information using the user ID
        const userResponse = await fetch(`https://react-sticky-note.onrender.com/user/${userId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${data.token}` } // Include the token for authentication
        });

        if (!userResponse.ok) {
            const userError = await userResponse.json();
            setMessage(userError.error || 'Failed to fetch user info');
            return;
        }

        const userData = await userResponse.json();
        setUserData({ email: userData.email, name: userData.name });
        setMessage(isLogin ? 'Login successful' : 'Signup successful and logged in');

      setTimeout(() => {
        setIsAuthenticated(true);
        setShowAuthMenu(false);
        fetchdata()
      }, 500);
  
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };
  
const backtoSignIN=()=>{
  setIsLogin(true)
  setMessage('')
}

const handleImageUpload = async (event,noteitm) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`https://react-sticky-note.onrender.com/${noteitm._id}`, {
          method: 'PATCH',
          body: formData
        });

        const data = await response.json();
        if (response.ok) {
          const imageUrl = data.imageUrl;
          setSelectedImage(imageUrl);
          const updatedContent = `${noteContent}<img src="${imageUrl}" alt="Uploaded Image" style="max-width: 100%; height: auto;" />`;
          setNoteContent(updatedContent);
          // handleBlur(noteitm)
        } else {
          console.error('Image upload failed:', data.error);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
};


  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <Draggable
        axis="both"
        handle=".handle"
        defaultPosition={{ x: 0, y: 0 }}
        position={null}
        grid={[25, 25]}
        scale={1}
      >
        <div className={`w-96 mt-20 mb-10 mx-auto shadow-md rounded-lg p-4 handle ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
          {!isAuthenticated ? (
            // Sign-up/Sign-in Form
            <div className="mt-20 mb-10 mx-auto rounded-lg p-4">
              <h2 className="text-2xl justify-center font-bold mb-4">{`${isLogin ? 'Sign In' : 'Sign Up'}`}</h2>
             {!isLogin && <input
                type="text"
                placeholder="User Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
                required
              />}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
                required
              />
              <button
                className="w-full bg-blue-500 text-white p-2 rounded-md"
                onClick={handleSignIn}
              >
               {`${isLogin ? 'Sign In' : 'Sign Up'}`}
              </button>

              {/* <p className='mt-4 text-red-700'>{message}</p> */}

              {isLogin ? <p className={`${message?.length > 0 ? 'mt-4 text-red-700' : 'mt-4 text-gray-600'}`}>
                {message?.length > 0 ? message : 'Don’t have an account?'} <a href="#" className="text-blue-500" onClick={()=>setIsLogin(false)}>Sign up</a>
              </p> :
              <p className={`${message?.length > 0 ? 'mt-4 text-red-700' : 'mt-4 text-gray-600'}`}>
                {message?.length > 0 ? message : 'Already have Account! Please'} <a href="#" className="text-blue-500" onClick={backtoSignIN}>Sign In</a>
              </p>}
            </div>)
            :
            (<>
              {!showAuthMenu && (<>
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-bold">Sticky Notes</h1>
                  <div className="flex space-x-2">
                    <PlusIcon className="h-6 w-6 text-gray-600 cursor-pointer" onClick={openNewNote}/>
                    <Cog6ToothIcon className="h-6 w-6 text-gray-600 cursor-pointer" onClick={toggleAuthMenu} />
                  </div>
                </div>
                <input type="text"
                  placeholder="Search..."
                  className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                  value={searchNote}
                  onChange={(e)=>setSearchNote(e.target.value)}
                />
                <div className="space-y-4">
                  {allNote
                    ?.filter((note) => {
                      // Always include items, even if the title or content is empty
                      const titleIncludesSearch = note?.Title?.toLowerCase()?.includes(searchNote?.toLowerCase());
                      const contentIncludesSearch = note?.content?.toLowerCase()?.includes(searchNote?.toLowerCase());
                
                      // Show notes even if the title or content is empty
                      return titleIncludesSearch || contentIncludesSearch || !note?.Title || !note?.content;
                    })
                    ?.map((note) => (
                    <div key={note._id} className="bg-yellow-100 p-4 rounded-lg shadow-sm relative">
                      <span className="text-xs text-gray-500 absolute top-2 right-4">{note.date}</span>
                      <h2 className="font-bold text-gray-700 mb-2">{note.Title}</h2>
                      <div className="text-sm text-gray-600 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: note?.content }}></div>
                      {/* Ellipsis Icon */}
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 absolute top-2 right-2 cursor-pointer" onClick={() => toggleDropdown(note._id)} />
    
                      {/* Dropdown Menu */}
                      {activeDropdown === note._id && (
                        <div className="absolute right-0 bg-white shadow-lg rounded-md -mr-14 z-10"  style={{ top: '30%' }}>
                          <ul>
                            {opennoteid !== note._id && <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer justify-between flex text-sm" onClick={() => openNote(note)}>
                              <ArrowUpOnSquareIcon className="w-5 text-gray-500 mr-2" />
                              Open Note
                            </li>}
                            {opennoteid === note._id && <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer justify-between flex text-sm " onClick={() => closeNote(note)}>
                              <ArrowDownOnSquareIcon className="w-5 text-gray-500 mr-2" />
                              Close Note
                            </li>}
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer justify-between flex text-sm" onClick={() => openDeleteModal(note)}>
                              <TrashIcon className="w-5 text-gray-500 mr-2" />
                              Delete Note
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>)}
              {showAuthMenu && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                      <ArrowLeftIcon className="h-6 w-6 text-gray-600 cursor-pointer" onClick={backNotelist}/> Settings
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-4 mb-6">
                      {/* Avatar */}
                      <Avatar sx={{ bgcolor: deepPurple[500] }}>{userData?.name[0]}</Avatar>
                      <div>
                        <h2 className="text-lg font-semibold">{userData?.name}</h2>
                        <p className="text-sm text-gray-500">{userData?.email}</p>
                        {IsSignIn ? <button className="text-blue-500 mt-1" onClick={handleSignup}>Sign In</button> : <button className="text-blue-500 mt-1" onClick={handleSignOut}>Sign out</button>}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-4">General</h3>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-gray-700">Enable insights</label>
                      <Switch
                        checked={insightsEnabled}
                        onChange={setInsightsEnabled}
                        className={`${
                          insightsEnabled ? "bg-blue-600" : "bg-gray-300"
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span
                          className={`${
                            insightsEnabled ? "translate-x-6" : "translate-x-1"
                          } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                        />
                      </Switch>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <label className="text-gray-700">Confirm before deleting</label>
                      <Switch
                        checked={confirmDelete}
                        onChange={setConfirmDelete}
                        className={`${
                          confirmDelete ? "bg-blue-600" : "bg-gray-300"
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span
                          className={`${
                            confirmDelete ? "translate-x-6" : "translate-x-1"
                          } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                        />
                      </Switch>
                    </div>
                    <h3 className="text-lg font-semibold mb-4">Color</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={theme === "light"}
                          onChange={() => setTheme("light")}
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>Light</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={theme === "dark"}
                          onChange={() => setTheme("dark")}
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>Dark</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="theme"
                          value="system"
                          checked={theme === "system"}
                          onChange={() => setTheme("system")}
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>Use my Windows mode</span>
                      </label>
                    </div>
                    <div className="mt-6 text-sm text-gray-600">
                      <h3 className="font-semibold mb-2">Help & feedback</h3>
                      <p>Need help or have feedback? Let us know!</p>
                    </div>
                  </div>
                </>
              )}
            </>)
          }
          {/* Delete Confirmation Modal */}
          <Dialog open={showModal} onClose={() => setShowModal(false)}>
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/5">
                <h2 className="text-xl font-bold mb-4">Do you want to delete this note?</h2>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="dontAskAgain"
                    checked={dontAskAgain}
                    onChange={() => setDontAskAgain(!dontAskAgain)}
                    className="mr-2"
                  />
                  <label htmlFor="dontAskAgain" className="text-sm -mt-1">Don't ask me again</label>
                </div>
                <div className="flex space-x-4 justify-end">
                  <button onClick={deleteNote} className="bg-blue-500 text-white px-4 py-2 rounded">Delete</button>
                  <button onClick={() => setShowModal(false)} className="bg-gray-300 px-4 py-2 rounded">Keep</button>
                </div>
              </div>
            </div>
          </Dialog>
          <Dialog open={showSignoutPopup} onClose={() => setshowSignoutPopup(false)}>
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/5">
                <h2 className="text-base font-semibold mb-4">You won't have access to your notes again until you sign back in.</h2>
                <div className="flex space-x-4 justify-end">
                  <button onClick={handleSignOutImmediately} className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Signed Out</button>
                  <button onClick={() => setshowSignoutPopup(false)} className="bg-gray-300 px-4 py-2 rounded">Stay Signed In</button>
                </div>
              </div>
            </div>
          </Dialog>
        </div>
      </Draggable>
      {showthenote && showingnoteitem?.map((note)=>(
        <Draggable
          key={note?._id}
          axis="both"
          handle=".handle"
          defaultPosition={{ x: 0, y: 0 }}
          position={null}
          grid={[25, 25]}
          scale={1}
        >
          <div key={note?._id} className="w-64 mx-auto bg-yellow-100 p-4 rounded-lg shadow-lg relative handle">
            <div className="flex justify-between mb-2">
              <PlusIcon className="h-5 w-5 text-gray-600 cursor-pointer" />
              <XMarkIcon className="h-5 w-5 text-gray-600 cursor-pointer"  onClick={cancelNote}/>
            </div>
            <div className="text-gray-800">
              <h2 className="font-bold mb-2 border-none focus:outline-none whitespace-pre-wrap"
                contentEditable 
                suppressContentEditableWarning={true} 
                onInput={handleTitleChange} 
                onFocus={(e) => e.currentTarget.focus()} 
                onMouseDown={(e) => e.stopPropagation()}
                onBlur={()=>handleBlur(note)} >
                {note?.Title}
              </h2>
              <div>
                <img src={selectedImage}/>
              </div>
              <div id='listcontent' className="text-sm text-gray-600 border-none focus:outline-none whitespace-pre-wrap"  style={{ minHeight: '50px' }}
                contentEditable 
                suppressContentEditableWarning={true} 
                onInput={handleContentChange} 
                onFocus={(e) => e.currentTarget.focus()} 
                onMouseDown={(e) => e.stopPropagation()}
                onBlur={()=>handleBlur(note)} 
                dangerouslySetInnerHTML={{ __html: note?.content }}>
              </div>
            </div>
            <div className="border-t border-gray-300 mt-4 pt-2 flex justify-around items-center text-gray-600">
              <button className="font-bold hover:bg-gray-400 active:bg-gray-400 w-8 h-8" onMouseDown={(e) => { e.preventDefault(); applyBold('bold'); }} title='bold'>B</button>
              <button className="italic hover:bg-gray-400 active:bg-gray-400 w-8 h-8" onMouseDown={(e) => { e.preventDefault(); applyBold('italic'); }} title='Italic'>I</button>
              <button className="underline hover:bg-gray-400 active:bg-gray-400 w-8 h-8" onMouseDown={(e) => { e.preventDefault(); applyBold('underline'); }} title='Underline'>U</button>
              <button className="line-through hover:bg-gray-400 active:bg-gray-400 w-8 h-8" onMouseDown={(e) => { e.preventDefault(); applyBold('strikethrough'); }} title='StrikeThrough'>S</button>
              <button className="text-sm hover:bg-gray-400 active:bg-gray-400 w-8 h-8" onMouseDown={(e) => { e.preventDefault(); applyBold('listbullet',true); }} title='List bullet'>
                <ListBulletIcon  className="h-5 w-5 ml-1.5 text-gray-600 cursor-pointer"/>
              </button>
             
              <input
                type="file"
                accept="image/*"
                onChange={(e)=>handleImageUpload(e,note)}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <button className="text-sm hover:bg-gray-400 active:bg-gray-400 w-8 h-8" title="Upload Image" type='button' onClick={() => document.getElementById('image-upload').click()}>
                  <PhotoIcon  className="h-5 w-5 ml-1.5 text-gray-600 cursor-pointer" style={{marginTop:'5px'}}/>
                </button>
              </label>
              
            </div>
          </div>
        </Draggable>
      ))}
    </div>
  );
}

export default App;