import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ArtworkDetailPage from './ArtworkDetailPage';

// Mock console.log to test function calls
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ArtworkDetailPage', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  test('renders artwork detail page', () => {
    render(<ArtworkDetailPage />);
    
    // Check if the title is present
    expect(screen.getByText('2024/10/3 我的自画像')).toBeInTheDocument();
    
    // Check if the description is present
    expect(screen.getByText(/这是我的自画像/)).toBeInTheDocument();
    
    // Check if the audio button text is present
    expect(screen.getByText('点击听录音')).toBeInTheDocument();
    
    // Check if the bottom text is present
    expect(screen.getByText('下滑查看ai画面分析')).toBeInTheDocument();
  });

  test('handles back button click', () => {
    const mockOnBack = jest.fn();
    render(<ArtworkDetailPage onBack={mockOnBack} />);
    
    // Find and click the back button
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  test('handles edit button click', () => {
    const mockOnEdit = jest.fn();
    render(<ArtworkDetailPage onEdit={mockOnEdit} />);
    
    // Find and click the edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  test('handles audio play button click', () => {
    render(<ArtworkDetailPage />);
    
    // Find and click the audio button
    const audioButton = screen.getByRole('button', { name: /volume/i });
    fireEvent.click(audioButton);
    
    expect(mockConsoleLog).toHaveBeenCalledWith('开始播放录音');
  });

  test('displays time correctly', () => {
    render(<ArtworkDetailPage />);
    
    // Check if the time is displayed
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });
});
