import type { ResumeDto, UpdateResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import debounce from "lodash.debounce";

import { axios } from "@/client/libs/axios";
import { queryClient } from "@/client/libs/query-client";

export const updateResume = async (data: UpdateResumeDto) => {
  try {
    const response = await axios.patch<ResumeDto, AxiosResponse<ResumeDto>, UpdateResumeDto>(
      `/resume/${data.id}`,
      data,
    );

    queryClient.setQueryData<ResumeDto>(["resume", { id: response.data.id }], response.data);

    queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
      if (!cache) return [response.data];
      return cache.map((resume) => {
        if (resume.id === response.data.id) return response.data;
        return resume;
      });
    });

    return response.data;
  } catch (error) {
    // If server request fails, update local resume
    const localResumes = JSON.parse(localStorage.getItem("resumes") || "[]");
    const updatedResumes = localResumes.map((resume: ResumeDto) => {
      if (resume.id === data.id) {
        return { ...resume, ...data, updatedAt: new Date() };
      }
      return resume;
    });
    
    localStorage.setItem("resumes", JSON.stringify(updatedResumes));
    
    // Return the updated resume
    const updatedResume = updatedResumes.find((resume: ResumeDto) => resume.id === data.id);
    
    queryClient.setQueryData<ResumeDto>(["resume", { id: data.id }], updatedResume);
    queryClient.setQueryData<ResumeDto[]>(["resumes"], updatedResumes);
    
    return updatedResume;
  }
};

export const debouncedUpdateResume = debounce(updateResume, 500);

export const useUpdateResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: updateResumeFn,
  } = useMutation({
    mutationFn: updateResume,
  });

  return { updateResume: updateResumeFn, loading, error };
};