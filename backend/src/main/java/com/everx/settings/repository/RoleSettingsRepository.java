package com.everx.settings.repository;

import com.everx.settings.entity.RoleSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleSettingsRepository extends JpaRepository<RoleSettings, UUID> {

    Optional<RoleSettings> findByRole_NameAndIsDeletedFalse(String roleName);
}