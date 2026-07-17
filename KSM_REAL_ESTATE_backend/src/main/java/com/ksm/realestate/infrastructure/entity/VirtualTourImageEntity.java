package com.ksm.realestate.infrastructure.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

/**
 * Persistence entity for VirtualTourImage.
 *
 * Maps to a table "virtual_tour_images".
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Table("virtual_tour_images")
public class VirtualTourImageEntity {

    @Id
    @Column("id")
    private Long id;

    @Column("property_id")
    private Long propertyId;

    @Column("room_label")
    private String roomLabel;

    @Column("image_url")
    private String imageUrl;

    @Column("display_order")
    private Integer displayOrder;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public String getRoomLabel() {
        return roomLabel;
    }

    public void setRoomLabel(String roomLabel) {
        this.roomLabel = roomLabel;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
