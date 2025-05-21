import type { DeleteResumeDto, ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";
import { queryClient } from "@/client/libs/query-client";

export const deleteResume = async (data: DeleteResumeDto) => {
  try {
    const response = await axios.delete<ResumeDto, AxiosResponse<ResumeDto>, DeleteResumeDto>(
      `/resume/${data.id}`,
    );

    return response.data;
  } catch (error) {
    // If server request fails, delete from local storage
    const localResumes = JSON.parse(localStorage.getItem("resumes") || "[]");
    const filteredResumes = localResumes.filter((resume: ResumeDto) => resume.id !== data.id);
    localStorage.setItem("resumes", JSON.stringify(filteredResumes));
    
    // Return a mock response with the id
    return { id: data.id } as ResumeDto;
  }
};

export const useDeleteResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: deleteResumeFn,
  } = useMutation({
    mutationFn: deleteResume,
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ["resume", data.id] });

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [];
        return cache.filter((resume) => resume.id !== data.id);
      });
    },
  });

  return { deleteResume: deleteResumeFn, loading, error };
};