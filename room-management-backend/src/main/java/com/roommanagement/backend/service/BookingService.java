package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.BookingRequest;
import com.roommanagement.backend.dto.BookingResponse;
import java.util.List;

public interface BookingService {
    List<BookingResponse> getAllBookings();
    BookingResponse getBookingById(Long id);
    BookingResponse createBooking(BookingRequest bookingRequest);
    BookingResponse cancelBooking(Long id);
    BookingResponse completeBooking(Long id);
    List<BookingResponse> getBookingsByCustomerId(Long customerId);
}
