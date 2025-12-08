package com.hotel.repository;

import com.hotel.model.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, Integer> {
	@Query("SELECT g FROM Guest g WHERE (:q IS NULL OR LOWER(g.fullName) LIKE %:q% OR g.idNumber LIKE %:q%) AND (:idType IS NULL OR g.idType = :idType)")
	List<Guest> searchByQueryAndType(@Param("q") String q, @Param("idType") String idType);
	
	Optional<Guest> findByPhone(String phone);
	
	Optional<Guest> findByIdNumber(String idNumber);
}
