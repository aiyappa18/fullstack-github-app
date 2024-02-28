import React, { useCallback, useEffect, useState } from 'react'
import Search from '../components/Search';
import SortRepos from '../components/SortRepos';
import ProfileInfo from '../components/ProfileInfo';
import Repos from '../components/Repos';
import toast from 'react-hot-toast';

const HomePage = () => {
  const[userProfile,setUserProfile]=useState(null);
  const[repos,setRepos]=useState([]);
  const [loading,setLoading]=useState(false);
  const [sortType,setSortType]=useState("recent");
  const getUserProfileAndRepo= useCallback( async(username="aiyappa18")=>{
    setLoading(true);
    try {
     
      const userResponse= await fetch(`https://api.github.com/users/${username}`,{
        headers:{
          authorization:`token ${import.meta.env.VITE_GITHUB_API_KEY}`
        }
      });
      const userProfile=await userResponse.json();
      setUserProfile(userProfile);

      const repoRes= await fetch(userProfile.repos_url);
      const repos=await repoRes.json();
      repos.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
      setRepos(repos);
      return {userProfile,repos};
    } 
    catch (error) 
    {
     toast.error('Failed to fetch user profile and repo') 
    }
    finally
    {
      setLoading(false);
    }
  },[]);
  useEffect(()=>{
 getUserProfileAndRepo();
  },[getUserProfileAndRepo])

  const onSearch=async(e,username) =>{
    e.preventDefault();
    setLoading(true);
    setRepos([]);
    setUserProfile(null);

    const {userProfile,repos}=await getUserProfileAndRepo(username);
    setUserProfile(userProfile);
    setRepos(repos);
    setLoading(false);
    setSortType("recent");  
  };

const onSort=( sortType)=>{
 if( sortType=== "recent")
 {
  repos.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
 }
 else if( sortType==="stars")
 {
  repos.sort((a,b)=>b.stargazers_count - a.stargazers_count)
 }
 else if( sortType === "forks")
 {
  repos.sort((a,b)=> b.forks_count - a.forks_count);
 }
 setSortType(sortType);
 setRepos([...repos]);
}

  return (
    <div className='m-4'>
    <Search onSearch={onSearch}/>
    {repos.length>0 && <SortRepos onSort={onSort} sortType={sortType} />}
    <div className='flex gap-4 flex-col lg:flex-row justify-center items-start'>
    {userProfile && !loading && <ProfileInfo userProfile={userProfile}/>}
   { !loading && <Repos repos={repos}/> }
    </div>
    </div>
  )
}
export default HomePage;