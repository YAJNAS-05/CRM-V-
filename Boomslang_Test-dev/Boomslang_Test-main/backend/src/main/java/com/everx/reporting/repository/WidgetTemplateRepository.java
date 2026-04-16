package com.everx.reporting.repository;

import com.everx.reporting.entity.WidgetTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WidgetTemplateRepository extends JpaRepository<WidgetTemplateEntity, Long> {
    
    List<WidgetTemplateEntity> findByWidgetType(String widgetType);
    
    List<WidgetTemplateEntity> findByCategory(String category);
    
    List<WidgetTemplateEntity> findByIsSystemTrue();
    
    List<WidgetTemplateEntity> findAll();
}
