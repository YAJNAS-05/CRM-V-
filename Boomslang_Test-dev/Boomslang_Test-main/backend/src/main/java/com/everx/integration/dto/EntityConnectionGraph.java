package com.everx.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityConnectionGraph {
    private UUID rootId;
    private String rootType;
    private Set<GraphNode> nodes;
    private Set<GraphEdge> edges;
}
