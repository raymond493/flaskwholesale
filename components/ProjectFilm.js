"use client";
import {useState} from "react";
export default function ProjectFilm({name,poster,src}){
 const [playing,setPlaying]=useState(false);
 return playing?<video className="rw-film" src={src} poster={poster} controls playsInline autoPlay preload="none" aria-label={`${name} product film`}/>:<button className="rw-film-play" type="button" onClick={()=>setPlaying(true)} aria-label={`Play ${name} product film`}><img src={poster} alt={`${name} finished custom tumbler`} width="900" height="900" loading="lazy"/><span>▶ Watch product film</span></button>;
}
