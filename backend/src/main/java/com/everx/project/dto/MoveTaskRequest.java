package com.everx.project.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveTaskRequest {
    private String status;
    private Integer statusOrder;
}
