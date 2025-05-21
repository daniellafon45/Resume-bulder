import type { CreateResumeDto, ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { createId } from "@paralleldrive/cuid2";
import { defaultResumeData } from "@reactive-resume/schema";

import { axios } from "@/client/libs/axios";
import { queryClient } from "@/client/libs/query-client";

export const createResume = async (data: CreateResumeDto) => {
  try {
    const response = await axios.post<ResumeDto, AxiosResponse<ResumeDto>, CreateResumeDto>(
      "/resume",
      data,
    );
    return response.data;
  } catch (error) {
    // If server request fails, create a local resume
    const id = createId();
    const newResume: ResumeDto = {
      id,
      title: data.title,
      slug: data.slug || id,
      visibility: data.visibility || "private",
      locked: false,
      userId: "local",
      data: defaultResumeData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store in localStorage
    const localResumes = JSON.parse(localStorage.getItem("resumes") || "[]");
    localResumes.push(newResume);
    localStorage.setItem("resumes", JSON.stringify(localResumes));
    
    return newResume;
  }
};

export const useCreateResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: createResumeFn,
  } = useMutation({
    mutationFn: createResume,
    onSuccess: (data) => {
      queryClient.setQueryData<ResumeDto>(["resume", { id: data.id }], data);

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [data];
        return [...cache, data];
      });
    },
  });

  return { createResume: createResumeFn, loading, error };
};