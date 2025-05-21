import type { ResumeDto } from "@reactive-resume/dto";
import { defaultResumeData } from "@reactive-resume/schema";
import { createId } from "@paralleldrive/cuid2";

import { axios } from "@/client/libs/axios";

export const findResumeById = async (data: { id: string }) => {
  try {
    const response = await axios.get<ResumeDto>(`/resume/${data.id}`);
    return response.data;
  } catch (error) {
    // If server request fails, try to find in local storage
    const localResumes = JSON.parse(localStorage.getItem("resumes") || "[]");
    const resume = localResumes.find((r: ResumeDto) => r.id === data.id);
    
    if (resume) {
      return resume;
    }
    
    // If not found in local storage, create a new one
    const newResume: ResumeDto = {
      id: data.id,
      title: "New Resume",
      slug: data.id,
      visibility: "private",
      locked: false,
      userId: "local",
      data: defaultResumeData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store in localStorage
    localResumes.push(newResume);
    localStorage.setItem("resumes", JSON.stringify(localResumes));
    
    return newResume;
  }
};

export const findResumeByUsernameSlug = async (data: { username: string; slug: string }) => {
  try {
    const response = await axios.get<ResumeDto>(`/resume/public/${data.username}/${data.slug}`);
    return response.data;
  } catch (error) {
    // If server request fails, try to find in local storage
    const localResumes = JSON.parse(localStorage.getItem("resumes") || "[]");
    const resume = localResumes.find((r: ResumeDto) => r.slug === data.slug);
    
    if (resume) {
      return resume;
    }
    
    // If not found, create a new one with the slug
    const id = createId();
    const newResume: ResumeDto = {
      id,
      title: "Shared Resume",
      slug: data.slug,
      visibility: "public",
      locked: false,
      userId: "local",
      data: defaultResumeData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store in localStorage
    localResumes.push(newResume);
    localStorage.setItem("resumes", JSON.stringify(localResumes));
    
    return newResume;
  }
};