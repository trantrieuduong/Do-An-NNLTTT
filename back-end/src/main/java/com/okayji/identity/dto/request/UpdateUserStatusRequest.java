package com.okayji.identity.dto.request;

import com.okayji.identity.entity.UserStatus;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class UpdateUserStatusRequest {
    @NotNull(message = "Status is required")
    private UserStatus status;
}
