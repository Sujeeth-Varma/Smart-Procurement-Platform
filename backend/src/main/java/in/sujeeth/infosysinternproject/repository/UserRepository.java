package in.sujeeth.infosysinternproject.repository;

import in.sujeeth.infosysinternproject.entity.User;
import in.sujeeth.infosysinternproject.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByDepartmentDepartmentIdAndRole(Long departmentId, Role role);
}
