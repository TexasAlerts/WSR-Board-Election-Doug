import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal, PromptModal } from '../components/AdminModal';

describe('ConfirmModal', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <ConfirmModal open={false} title="Test" message="Msg" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders dialog when open', () => {
    render(
      <ConfirmModal open={true} title="Delete?" message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete?')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmModal open={true} title="Test" message="Msg" onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmModal open={true} title="Test" message="Msg" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel on Escape key', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmModal open={true} title="Test" message="Msg" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('PromptModal', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <PromptModal open={false} title="T" label="L" onSubmit={() => {}} onCancel={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders text input by default', () => {
    render(
      <PromptModal open={true} title="Enter" label="Value:" defaultValue="hi" onSubmit={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Value:')).toHaveValue('hi');
  });

  it('renders textarea when multiline', () => {
    render(
      <PromptModal open={true} title="Enter" label="Notes:" multiline={true} onSubmit={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByLabelText('Notes:').tagName).toBe('TEXTAREA');
  });

  it('submits value on form submit', () => {
    const onSubmit = jest.fn();
    render(
      <PromptModal open={true} title="T" label="L" defaultValue="test" onSubmit={onSubmit} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByText('Submit'));
    expect(onSubmit).toHaveBeenCalledWith('test');
  });
});
