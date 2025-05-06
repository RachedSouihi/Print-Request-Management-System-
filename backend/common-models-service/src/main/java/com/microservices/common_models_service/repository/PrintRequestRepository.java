package com.microservices.common_models_service.repository;


import com.microservices.common_models_service.model.PrintRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface PrintRequestRepository extends JpaRepository<PrintRequest, String> {

    @Query("SELECT SUM(pr.copies) FROM PrintRequest pr WHERE pr.createdAt BETWEEN :start AND :end")
    Integer sumPagesByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(pr) FROM PrintRequest pr WHERE pr.createdAt BETWEEN :start AND :end")
    Long countRequestsByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT pr.user) FROM PrintRequest pr WHERE pr.createdAt BETWEEN :start AND :end")
    Integer countActiveUsersByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
